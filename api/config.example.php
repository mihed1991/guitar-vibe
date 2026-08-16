<?php

return [
    // Токен, полученный у @BotFather. Никогда не публикуйте config.php в Git.
    'telegram_bot_token' => 'ВСТАВЬТЕ_ТОКЕН_БОТА',

    // Отдельный длинный ключ для раздела «Заявки в Telegram» в админке сайта.
    'admin_api_key' => 'ЗАМЕНИТЕ_НА_ДЛИННЫЙ_СЛУЧАЙНЫЙ_КЛЮЧ',

    // Адреса сайтов, которым разрешено отправлять заявки.
    'allowed_origins' => [
        'https://mihed1991.github.io',
        'https://ваш-домен.by',
    ],

    // Папка storage должна быть доступна PHP для записи.
    'storage_dir' => __DIR__ . '/storage',
];
