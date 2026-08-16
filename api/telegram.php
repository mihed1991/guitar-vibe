<?php

declare(strict_types=1);

final class ApiException extends RuntimeException
{
    public $status;

    public function __construct(int $status, string $message)
    {
        parent::__construct($message);
        $this->status = $status;
    }
}

$configFile = __DIR__ . '/config.php';
$fileConfig = is_file($configFile) ? require $configFile : [];
$config = [
    'telegram_bot_token' => (string) ($fileConfig['telegram_bot_token'] ?? getenv('TELEGRAM_BOT_TOKEN') ?: ''),
    'admin_api_key' => (string) ($fileConfig['admin_api_key'] ?? getenv('ADMIN_API_KEY') ?: ''),
    'allowed_origins' => $fileConfig['allowed_origins'] ?? splitOrigins((string) (getenv('ALLOWED_ORIGINS') ?: 'https://mihed1991.github.io')),
    'storage_dir' => (string) ($fileConfig['storage_dir'] ?? getenv('TELEGRAM_STORAGE_DIR') ?: __DIR__ . '/storage'),
];

$origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
$originAllowed = isAllowedOrigin($origin, (array) $config['allowed_origins']);
if ($originAllowed) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code($originAllowed ? 204 : 403);
    exit;
}

try {
    $action = (string) ($_GET['action'] ?? 'health');
    $method = (string) ($_SERVER['REQUEST_METHOD'] ?? 'GET');

    if ($action === 'health' && $method === 'GET') {
        respond(['ok' => true, 'service' => 'guitar-vibe-telegram-php']);
    }

    if (!$originAllowed) {
        throw new ApiException(403, 'Этот сайт не может обращаться к обработчику.');
    }

    ensureStorage((string) $config['storage_dir']);

    if ($action === 'lead' && $method === 'POST') {
        receiveLead($config);
    }

    if ($action === 'settings' && $method === 'GET') {
        ensureAdmin($config);
        $settings = readJsonFile(settingsPath($config), []);
        $chatIds = storedChatIds($settings);
        respond(['ok' => true, 'chatIds' => $chatIds, 'chatId' => $chatIds[0] ?? '']);
    }

    if ($action === 'settings' && $method === 'PUT') {
        ensureAdmin($config);
        $body = readRequestJson();
        $chatIds = requestedChatIds($body['chatIds'] ?? ($body['chatId'] ?? []));
        writeJsonFile(settingsPath($config), ['chat_ids' => $chatIds]);
        respond(['ok' => true, 'chatIds' => $chatIds, 'chatId' => $chatIds[0]]);
    }

    if ($action === 'test' && $method === 'POST') {
        ensureAdmin($config);
        $delivery = sendTelegramToConfiguredRecipients($config, "<b>Guitar Vibe</b>\n\n✅ Тестовое сообщение. Заявки с сайта будут приходить в этот чат.");
        respond(['ok' => true] + $delivery);
    }

    throw new ApiException(404, 'Маршрут не найден.');
} catch (ApiException $error) {
    respond(['ok' => false, 'error' => $error->getMessage()], (int) $error->status);
} catch (Throwable $error) {
    error_log('[guitar-vibe-telegram] ' . $error->getMessage());
    respond(['ok' => false, 'error' => 'Сервис временно недоступен. Попробуйте позже.'], 500);
}

function receiveLead(array $config): void
{
    $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > 12000) {
        throw new ApiException(413, 'Слишком большой запрос.');
    }

    $body = readRequestJson();
    if (!empty($body['website'])) {
        respond(['ok' => true]);
    }

    $lead = [
        'name' => clean($body['name'] ?? '', 80),
        'phone' => clean($body['phone'] ?? '', 80),
        'level' => clean($body['level'] ?? '', 60),
        'wish' => clean($body['wish'] ?? '', 700),
        'instrument' => clean($body['instrument'] ?? '', 80),
        'format' => clean($body['format'] ?? '', 80),
        'time' => clean($body['time'] ?? '', 80),
    ];

    if (textLength($lead['name']) < 2) {
        throw new ApiException(400, 'Укажите имя.');
    }
    if (textLength($lead['phone']) < 5) {
        throw new ApiException(400, 'Укажите телефон или Telegram.');
    }
    if ($lead['instrument'] === '' || $lead['format'] === '' || $lead['time'] === '') {
        throw new ApiException(400, 'Заполните параметры занятия.');
    }

    $fingerprint = hash('sha256', textLower(implode('|', [
        $lead['name'], $lead['phone'], $lead['instrument'], $lead['format'], $lead['time'],
    ])));
    if (checkRequestLimits($config, $fingerprint)) {
        respond(['ok' => true, 'duplicate' => true]);
    }

    date_default_timezone_set('Europe/Minsk');
    $message = implode("\n", [
        '<b>🎸 Новая заявка — Guitar Vibe</b>',
        '',
        '<b>Имя:</b> ' . html($lead['name']),
        '<b>Телефон / Telegram:</b> ' . html($lead['phone']),
        '<b>Инструмент:</b> ' . html($lead['instrument']),
        '<b>Уровень:</b> ' . html($lead['level'] ?: 'не указан'),
        '<b>Формат:</b> ' . html($lead['format']),
        '<b>Время:</b> ' . html($lead['time']),
        '<b>Пожелания:</b> ' . html($lead['wish'] ?: 'не указаны'),
        '',
        '<i>' . html(date('d.m.Y H:i')) . '</i>',
    ]);

    sendTelegramToConfiguredRecipients($config, $message);
    rememberLead($config, $fingerprint);
    respond(['ok' => true]);
}

function sendTelegramToConfiguredRecipients(array $config, string $text): array
{
    $chatIds = configuredChatIds($config);
    $sent = 0;
    $failed = 0;
    $lastError = null;

    foreach ($chatIds as $chatId) {
        try {
            sendTelegram($config, $chatId, $text);
            $sent++;
        } catch (Throwable $error) {
            $failed++;
            $lastError = $error;
            error_log('[guitar-vibe-telegram] recipient ' . hash('sha256', $chatId) . ': ' . $error->getMessage());
        }
    }

    if ($sent === 0) {
        if ($lastError instanceof ApiException) {
            throw $lastError;
        }
        throw new ApiException(502, 'Не удалось отправить сообщение получателям Telegram.');
    }

    return ['sent' => $sent, 'failed' => $failed];
}

function sendTelegram(array $config, string $chatId, string $text): void
{
    $token = trim((string) $config['telegram_bot_token']);
    if ($token === '' || strpos($token, 'ВСТАВЬТЕ_') === 0) {
        throw new ApiException(503, 'Telegram-бот ещё не подключён.');
    }

    if (!preg_match('/^\d+:[A-Za-z0-9_-]{20,}$/', $token)) {
        throw new ApiException(503, 'Укажите корректный токен Telegram-бота.');
    }
    $url = 'https://api.telegram.org/bot' . $token . '/sendMessage';
    $payload = json_encode([
        'chat_id' => $chatId,
        'text' => $text,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => true,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 12,
        ]);
        $responseBody = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $curlError = curl_error($curl);
        curl_close($curl);
        if ($responseBody === false) {
            error_log('[guitar-vibe-telegram] curl: ' . $curlError);
            throw new ApiException(502, 'Не удалось связаться с Telegram.');
        }
    } else {
        $context = stream_context_create(['http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $payload,
            'timeout' => 12,
            'ignore_errors' => true,
        ]]);
        $responseBody = @file_get_contents($url, false, $context);
        $statusLine = $http_response_header[0] ?? '';
        preg_match('/\s(\d{3})\s/', $statusLine, $match);
        $status = isset($match[1]) ? (int) $match[1] : 0;
    }

    $result = is_string($responseBody) ? json_decode($responseBody, true) : null;
    if ($status < 200 || $status >= 300 || empty($result['ok'])) {
        throw new ApiException(502, 'Telegram не принял сообщение. Проверьте токен бота и chat_id.');
    }
}

function ensureAdmin(array $config): void
{
    $expected = trim((string) $config['admin_api_key']);
    $header = (string) ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
    $supplied = substr($header, 0, 7) === 'Bearer ' ? substr($header, 7) : '';
    if ($expected === '' || strpos($expected, 'ЗАМЕНИТЕ_') === 0) {
        throw new ApiException(503, 'Ключ управления ещё не настроен на сервере.');
    }
    if ($supplied === '' || !hash_equals($expected, $supplied)) {
        throw new ApiException(401, 'Неверный ключ подключения.');
    }
}

function configuredChatIds(array $config): array
{
    $settings = readJsonFile(settingsPath($config), []);
    $chatIds = storedChatIds($settings);
    if (!$chatIds) {
        throw new ApiException(503, 'Получатель Telegram ещё не настроен.');
    }
    return $chatIds;
}

function checkRequestLimits(array $config, string $fingerprint): bool
{
    $path = rtrim((string) $config['storage_dir'], DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . '.limits.json';
    $now = time();
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $ipKey = hash('sha256', $ip);

    $duplicate = false;
    updateJsonFile($path, function (array $data) use ($now, $ipKey, $fingerprint, &$duplicate): array {
        $requests = array_values(array_filter((array) ($data['requests'][$ipKey] ?? []), function ($time) use ($now) {
            return is_numeric($time) && (int) $time > $now - 600;
        }));
        if (count($requests) >= 5) {
            throw new ApiException(429, 'Слишком много заявок. Попробуйте немного позже.');
        }
        $duplicates = (array) ($data['duplicates'] ?? []);
        foreach ($duplicates as $key => $time) {
            if (!is_numeric($time) || (int) $time <= $now - 180) {
                unset($duplicates[$key]);
            }
        }
        if (isset($duplicates[$fingerprint])) {
            $duplicate = true;
            return $data;
        }
        $requests[] = $now;
        $data['requests'][$ipKey] = $requests;
        $data['duplicates'] = $duplicates;
        return $data;
    });
    return $duplicate;
}

function rememberLead(array $config, string $fingerprint): void
{
    $path = rtrim((string) $config['storage_dir'], DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . '.limits.json';
    updateJsonFile($path, function (array $data) use ($fingerprint): array {
        $data['duplicates'][$fingerprint] = time();
        return $data;
    });
}

function readRequestJson(): array
{
    $type = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
    if (strpos($type, 'application/json') === false) {
        throw new ApiException(415, 'Ожидается JSON-запрос.');
    }
    $body = file_get_contents('php://input');
    $data = json_decode((string) $body, true);
    if (!is_array($data)) {
        throw new ApiException(400, 'Некорректные данные запроса.');
    }
    return $data;
}

function normalizeChatId($value): string
{
    $text = trim((string) $value);
    return preg_match('/^-?\d{5,16}$/', $text) || preg_match('/^@[A-Za-z][A-Za-z0-9_]{4,31}$/', $text) ? $text : '';
}

function requestedChatIds($value): array
{
    $values = is_array($value) ? $value : [$value];
    if (count($values) > 20) {
        throw new ApiException(400, 'Можно добавить не более 20 получателей.');
    }

    $chatIds = [];
    foreach ($values as $raw) {
        if (!is_scalar($raw) && $raw !== null) {
            throw new ApiException(400, 'Укажите корректные chat_id получателей.');
        }
        $text = trim((string) $raw);
        if ($text === '') {
            continue;
        }
        $chatId = normalizeChatId($text);
        if ($chatId === '') {
            throw new ApiException(400, 'Укажите корректные chat_id получателей.');
        }
        $chatIds[$chatId] = true;
    }

    $chatIds = array_keys($chatIds);
    if (!$chatIds) {
        throw new ApiException(400, 'Добавьте хотя бы один chat_id.');
    }
    return $chatIds;
}

function storedChatIds(array $settings): array
{
    $values = isset($settings['chat_ids']) && is_array($settings['chat_ids'])
        ? $settings['chat_ids']
        : (isset($settings['chat_id']) ? [$settings['chat_id']] : []);
    $chatIds = [];
    foreach ($values as $value) {
        if (!is_scalar($value) && $value !== null) {
            continue;
        }
        $chatId = normalizeChatId($value);
        if ($chatId !== '') {
            $chatIds[$chatId] = true;
        }
    }
    return array_slice(array_keys($chatIds), 0, 20);
}

function clean($value, int $max): string
{
    $text = preg_replace('/[\x00-\x1F\x7F]/u', ' ', (string) $value);
    $text = preg_replace('/\s+/u', ' ', (string) $text);
    return textSlice(trim((string) $text), $max);
}

function html(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function settingsPath(array $config): string
{
    return rtrim((string) $config['storage_dir'], DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . '.settings.json';
}

function textLength(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function textLower(string $value): string
{
    return function_exists('mb_strtolower') ? mb_strtolower($value, 'UTF-8') : strtolower($value);
}

function textSlice(string $value, int $max): string
{
    return function_exists('mb_substr') ? mb_substr($value, 0, $max, 'UTF-8') : substr($value, 0, $max);
}

function ensureStorage(string $directory): void
{
    if (!is_dir($directory) && !mkdir($directory, 0770, true) && !is_dir($directory)) {
        throw new RuntimeException('Не удалось создать папку хранения.');
    }
    if (!is_writable($directory)) {
        throw new RuntimeException('Папка хранения недоступна для записи.');
    }
}

function readJsonFile(string $path, array $fallback): array
{
    if (!is_file($path)) {
        return $fallback;
    }
    $data = json_decode((string) file_get_contents($path), true);
    return is_array($data) ? $data : $fallback;
}

function writeJsonFile(string $path, array $data): void
{
    updateJsonFile($path, function () use ($data): array {
        return $data;
    });
}

function updateJsonFile(string $path, callable $update): void
{
    $handle = fopen($path, 'c+');
    if ($handle === false) {
        throw new RuntimeException('Не удалось открыть файл хранения.');
    }
    try {
        if (!flock($handle, LOCK_EX)) {
            throw new RuntimeException('Не удалось заблокировать файл хранения.');
        }
        rewind($handle);
        $current = json_decode((string) stream_get_contents($handle), true);
        $next = $update(is_array($current) ? $current : []);
        $encoded = json_encode($next, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        rewind($handle);
        ftruncate($handle, 0);
        if (fwrite($handle, (string) $encoded) === false) {
            throw new RuntimeException('Не удалось сохранить настройки.');
        }
        fflush($handle);
        flock($handle, LOCK_UN);
    } finally {
        fclose($handle);
    }
}

function isAllowedOrigin(string $origin, array $allowed): bool
{
    if ($origin === '') {
        return true;
    }
    $normalized = rtrim(strtolower($origin), '/');
    foreach ($allowed as $item) {
        if ($normalized === rtrim(strtolower((string) $item), '/')) {
            return true;
        }
    }
    $originHost = parse_url($origin, PHP_URL_HOST);
    $serverHost = preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? ''));
    return is_string($originHost) && $originHost !== '' && strtolower($originHost) === strtolower($serverHost);
}

function splitOrigins(string $value): array
{
    return array_values(array_filter(array_map('trim', explode(',', $value))));
}

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
