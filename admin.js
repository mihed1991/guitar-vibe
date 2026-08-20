(function () {
  'use strict';

  const STORAGE_KEY = 'guitar-vibe-content-v1';
  const PASSWORD_KEY = 'guitar-vibe-admin-password-v1';
  const SESSION_KEY = 'guitar-vibe-admin-unlocked';
  const TELEGRAM_SETTINGS_KEY = 'guitar-vibe-telegram-settings-v1';
  const DEFAULT_PASSWORD = '020304';

  const sections = [
    { id: 'general', title: 'Главная и шапка', hint: 'Название вкладки, адрес, главный экран и основные кнопки. Адрес автоматически становится ссылкой на Яндекс Карты.' },
    { id: 'formats', title: 'Форматы', hint: 'Меняйте названия, описания и списки инструментов. Один инструмент — одна строка или элемент через запятую.' },
    { id: 'age', title: 'Возраст', hint: 'Редактируйте заголовок раздела и каждую возрастную карточку отдельно.' },
    { id: 'lessons', title: 'Как проходят занятия', hint: 'Четыре шага синхронно обновляются в настольной и мобильной версиях.' },
    { id: 'about', title: 'О студии', hint: 'Текст и фотографии можно заменить. Для изображения вставьте прямую ссылку на файл.' },
    { id: 'instruments', title: 'Инструменты', hint: 'Названия и доступные форматы обновляются сразу в обеих версиях сайта.' },
    { id: 'reviews', title: 'Отзывы', hint: 'Можно менять имя, подпись, текст отзыва и фотографию каждого ученика.' },
    { id: 'pricing', title: 'Стоимость', hint: 'Цены вводятся без валюты. Преимущества тарифа — по одному пункту в строке.' },
    { id: 'cta', title: 'Призыв к действию', hint: 'Финальный блок записи и телефон консультации. Телефон автоматически станет кликабельным.' },
    { id: 'footer', title: 'Футер и контакты', hint: 'Добавляйте ссылки, телефоны и email. Телефоны получают ссылку tel:, email — mailto:.' },
    { id: 'telegram', title: 'Заявки в Telegram', hint: 'Подключите защищённый обработчик, добавьте chat_id получателей и отправьте тестовое сообщение всем.' },
    { id: 'security', title: 'Доступ', hint: 'Смените пароль администратора. Новый пароль действует сразу на этом устройстве.' }
  ];

  const entries = [
    field('general','pageTitle','Название вкладки','title',{help:'Отображается во вкладке браузера.'}),
    field('general','siteBrand','Название в шапке','.brand, .m-brand-text',{mode:'siteBrand'}),
    field('general','address','Адрес','.addr-text',{wide:true,mode:'address',help:'По этому тексту формируется ссылка поиска в Яндекс Картах.'}),
    field('general','heroEyebrow','Надзаголовок','.hero-card .eyebrow',{wide:true}),
    field('general','heroTitle','Главный заголовок — desktop','.hero-title > span:first-child',{help:'Месяц редактируется отдельно.'}),
    field('general','mobileHeroTitle','Главный заголовок — mobile','.m-hero-copy h1',{mode:'textBeforeElement',help:'Текст перед выделенным месяцем.'}),
    field('general','heroMonth','Акцент в заголовке','.hero-title .accent, .m-hero-copy h1 span'),
    field('general','heroDesktopDescription','Описание на большом экране','.hero-desc',{wide:true,multiline:true}),
    field('general','heroMobileDescription','Подпись на мобильном','.m-hero-copy p',{wide:true}),
    field('general','heroButton','Главная кнопка','.hero-card .btn-main, .m-hero-card .m-main-btn'),
    field('general','heroSecondaryButton','Дополнительная кнопка','.hero-card .btn-ghost'),
    field('general','heroSecondaryTarget','Переход дополнительной кнопки','.hero-card .btn-ghost',{attr:'data-scroll',help:'Укажите якорь раздела, например #how или #reviews.'}),
    field('general','cardsButton','Кнопки в карточках','.small-main, .m-card-btn, .price-btn, .m-price-btn'),
    field('general','desktopHeroImage','Фоновое фото — desktop','.desktop-stage > .hero-image',{attr:'src',image:true,wide:true}),
    field('general','mobileHeroImage','Фоновое фото — mobile','.m-hero-bg img',{attr:'src',image:true,wide:true}),

    field('formats','formatsLabel','Название раздела','.format > .section-label, .m-formats > .m-section-label'),
    field('formats','offlineTitle','Офлайн — название','.format-card:nth-child(1) h3, .m-format-card:nth-child(2) h3'),
    field('formats','offlineDescription','Офлайн — описание','.format-card:nth-child(1) .desc, .m-format-card:nth-child(2) .m-desc',{wide:true,multiline:true}),
    listField('formats','offlineTags','Офлайн — инструменты','.format-card:nth-child(1) .tags, .m-format-card:nth-child(2) .m-tags'),
    field('formats','groupTitle','Группа — название','.format-card:nth-child(2) h3, .m-format-card:nth-child(1) h3'),
    field('formats','groupDescription','Группа — описание','.format-card:nth-child(2) .desc, .m-format-card:nth-child(1) .m-desc',{wide:true,multiline:true}),
    listField('formats','groupTags','Группа — инструменты','.format-card:nth-child(2) .tags, .m-format-card:nth-child(1) .m-tags'),
    field('formats','onlineTitle','Онлайн — название','.format-card:nth-child(3) h3, .m-format-card:nth-child(3) h3'),
    field('formats','onlineDescription','Онлайн — описание','.format-card:nth-child(3) .desc, .m-format-card:nth-child(3) .m-desc',{wide:true,multiline:true}),
    listField('formats','onlineTags','Онлайн — инструменты','.format-card:nth-child(3) .tags, .m-format-card:nth-child(3) .m-tags'),

    field('age','ageLabel','Название раздела','.age > .section-label'),
    field('age','ageTitle','Заголовок','.age-title',{wide:true}),
    field('age','ageDescription','Описание','.age-sub',{wide:true,multiline:true}),
    ...cardFields('age','ageCard','.age-card',5,['Диапазон','Название','Описание'],['.age-badge','h3','p']),

    field('lessons','lessonsLabel','Название раздела','.how > .section-label, .m-how > .m-section-label'),
    ...pairedCardFields('lessons','lesson','.how-card','.m-how-card',4,['Название','Описание'],['h3','p'],['.m-how-copy h3','.m-how-copy p']),

    field('about','aboutLabel','Название раздела','.about > .section-label, .m-about > .m-section-label'),
    field('about','aboutTitle','Заголовок','.about-title',{wide:true}),
    field('about','aboutDescription','Описание','.about-card p, .m-about-card p',{wide:true,multiline:true,mode:'aboutCopy'}),
    field('about','aboutDesktopImage','Фото — desktop','.about-photo',{attr:'src',image:true,wide:true}),
    field('about','aboutMobileImage','Фото — mobile','.m-about-photo',{attr:'src',image:true,wide:true}),

    field('instruments','instrumentsLabel','Название раздела','.instruments > .section-label, .m-instruments > .m-section-label'),
    field('instruments','instrumentsTitle','Заголовок','.inst-title',{wide:true}),
    ...pairedCardFields('instruments','instrument','.inst-card','.m-inst',5,['Название','Форматы'],['strong','> div'],['strong','> div'],['text','inlineList']),

    field('reviews','reviewsLabel','Название раздела','.reviews > .section-label, .m-reviews > .m-section-label'),
    ...reviewFields(),

    field('pricing','pricingLabel','Название раздела','.pricing > .section-label, .m-pricing > .m-section-label'),
    ...pricingFields('trial',1,1,'Пробное занятие'),
    ...pricingFields('groupPlan',2,3,'Группа'),
    ...pricingFields('individual',3,2,'Индивидуально'),

    field('cta','ctaTitle','Заголовок','.cta-copy h2, .m-cta-copy h2',{wide:true}),
    field('cta','ctaSubtitle','Подзаголовок','.cta-copy p, .m-cta-copy p',{wide:true,mode:'ctaSubtitle'}),
    field('cta','consultButton','Кнопка консультации','.cta-secondary .l1, .m-consult'),
    field('cta','consultPhone','Телефон консультации','.cta-secondary .l2',{mode:'phone',help:'Можно вводить с пробелами, скобками и дефисами.'}),
    field('cta','finalButton','Кнопка записи','.cta-primary, .m-cta-primary'),

    field('footer','footerTitle','Название студии','.footer-brand h2, .m-footer-brand h2',{wide:true,mode:'footerBrand'}),
    field('footer','footerDescription','Описание','.footer-brand p, .m-footer-brand p',{wide:true,multiline:true}),
    field('footer','footerLegal','Юридическая информация','.footer-legal, .m-footer-legal',{wide:true,multiline:true}),
    field('footer','copyright','Копирайт','.copy, .m-copy',{wide:true})
  ];

  function field(section,key,label,selectors,options={}) { return { section,key,label,selectors,...options }; }
  function listField(section,key,label,selectors) { return field(section,key,label,selectors,{wide:true,multiline:true,mode:'list',help:'По одному пункту в строке или через запятую.'}); }
  function cardFields(section,prefix,selector,count,labels,children) {
    const result=[];
    for(let i=1;i<=count;i++) labels.forEach((label,index)=>result.push(field(section,`${prefix}${i}_${index}`,`Карточка ${i} — ${label}`,`${selector}:nth-child(${i}) ${children[index]}`,{wide:index===2,multiline:index===2})));
    return result;
  }
  function pairedCardFields(section,prefix,desktop,mobile,count,labels,dChildren,mChildren,modes=[]) {
    const result=[];
    for(let i=1;i<=count;i++) labels.forEach((label,index)=>result.push(field(section,`${prefix}${i}_${index}`,`${i}. ${label}`,`${desktop}:nth-child(${i}) ${dChildren[index]}, ${mobile}:nth-child(${i}) ${mChildren[index]}`,{wide:index===1,multiline:index===1,mode:modes[index]})));
    return result;
  }
  function reviewFields(){
    const result=[];
    for(let i=1;i<=3;i++){
      result.push(field('reviews',`review${i}Name`,`Отзыв ${i} — имя`,`.review:nth-child(${i}) .review-person strong, .m-review:nth-child(${i}) .m-review-person strong`));
      result.push(field('reviews',`review${i}Meta`,`Отзыв ${i} — подпись`,`.review:nth-child(${i}) .review-person small, .m-review:nth-child(${i}) .m-review-person small`));
      result.push(field('reviews',`review${i}Text`,`Отзыв ${i} — текст`,`.review:nth-child(${i}) .review-text, .m-review:nth-child(${i}) .m-review-copy p`,{wide:true,multiline:true}));
      result.push(field('reviews',`review${i}Image`,`Отзыв ${i} — фото`,`.review:nth-child(${i}) .review-person > img, .m-review:nth-child(${i}) .m-review-person > img`,{attr:'src',image:true,wide:true}));
    }
    return result;
  }
  function pricingFields(key,desktopIndex,mobileIndex,label){
    return [
      field('pricing',`${key}Title`,`${label} — название`,`.price-card:nth-child(${desktopIndex}) h3, .m-price-card:nth-child(${mobileIndex}) h3`),
      field('pricing',`${key}Price`,`${label} — цена`,`.price-card:nth-child(${desktopIndex}) .price, .m-price-card:nth-child(${mobileIndex}) .m-price`,{mode:'price'}),
      field('pricing',`${key}Subtitle`,`${label} — описание`,`.price-card:nth-child(${desktopIndex}) .price-mid > div, .m-price-card:nth-child(${mobileIndex}) .m-price-sub`,{wide:true}),
      listField('pricing',`${key}Features`,`${label} — преимущества`,`.price-card:nth-child(${desktopIndex}) .price-mid ul`)
    ];
  }

  const repeaters = {
    formats:{itemName:'формат',items:[
      {title:'Офлайн в студии',keys:['offlineTitle','offlineDescription','offlineTags'],selector:'.format-card:nth-child(1), .m-format-card:nth-child(2)'},
      {title:'Групповой формат',keys:['groupTitle','groupDescription','groupTags'],selector:'.format-card:nth-child(2), .m-format-card:nth-child(1)'},
      {title:'Онлайн уроки',keys:['onlineTitle','onlineDescription','onlineTags'],selector:'.format-card:nth-child(3), .m-format-card:nth-child(3)'}
    ]},
    age:{itemName:'возрастную карточку',items:Array.from({length:5},(_,i)=>({title:`Возрастная карточка ${i+1}`,keys:[`ageCard${i+1}_0`,`ageCard${i+1}_1`,`ageCard${i+1}_2`],selector:'.age-card',elementIndex:i}))},
    lessons:{itemName:'этап',items:Array.from({length:4},(_,i)=>({title:`Этап ${i+1}`,keys:[`lesson${i+1}_0`,`lesson${i+1}_1`],selector:`.how-card:nth-child(${i+1}), .m-how-card:nth-child(${i+1})`}))},
    instruments:{itemName:'инструмент',items:Array.from({length:5},(_,i)=>({title:`Инструмент ${i+1}`,keys:[`instrument${i+1}_0`,`instrument${i+1}_1`],selector:`.inst-card:nth-child(${i+1}), .m-inst:nth-child(${i+1})`}))},
    reviews:{itemName:'отзыв',items:Array.from({length:3},(_,i)=>({title:`Отзыв ${i+1}`,keys:[`review${i+1}Name`,`review${i+1}Meta`,`review${i+1}Text`,`review${i+1}Image`],selector:`.review:nth-child(${i+1}), .m-review:nth-child(${i+1})`}))},
    pricing:{itemName:'тариф',items:[
      {title:'Пробное занятие',keys:['trialTitle','trialPrice','trialSubtitle','trialFeatures'],selector:'.price-card:nth-child(1), .m-price-card:nth-child(1)'},
      {title:'В группе',keys:['groupPlanTitle','groupPlanPrice','groupPlanSubtitle','groupPlanFeatures'],selector:'.price-card:nth-child(2), .m-price-card:nth-child(3)'},
      {title:'Индивидуально',keys:['individualTitle','individualPrice','individualSubtitle','individualFeatures'],selector:'.price-card:nth-child(3), .m-price-card:nth-child(2)'}
    ]}
  };
  const publicSections={
    general:'.site-header, .hero-image, .hero-card, .m-header, .m-hero-bg, .m-hero-card',formats:'.format, .m-formats',age:'.age',lessons:'.how, .m-how',about:'.about, .m-about',instruments:'.instruments, .m-instruments',reviews:'.reviews, .m-reviews',pricing:'.pricing, .m-pricing',cta:'.cta, .m-cta',footer:'.footer, .m-footer'
  };
  const managedElements={heroSecondary:{section:'general',label:'дополнительную кнопку',selector:'.hero-card .btn-ghost'}};

  const defaultContacts = [
    { type:'link', label:'Телеграм', value:'', image:'./assets/telegram.svg' },
    { type:'link', label:'Инстаграм', value:'', image:'./assets/instagram.svg' },
    { type:'link', label:'Вконтакте', value:'', image:'./assets/vk.svg' },
    { type:'phone', label:'+375298707651', value:'+375298707651', image:'' }
  ];

  const defaults = Object.fromEntries(entries.map(entry=>[entry.key,readEntry(entry)]));
  let persisted = readStored();
  let model = normalizeModel(persisted);
  let draft = clone(model);
  let currentSection = 'general';
  let dirty = false;
  let overlay;
  let telegramSettings = readTelegramSettings();

  applyModel(model);
  installAdminEntries();
  createOverlay();

  function readEntry(entry){
    const element=document.querySelector(entry.selectors);
    if(!element) return '';
    if(entry.attr) return element.getAttribute(entry.attr)||'';
    if(entry.mode==='textBeforeElement') return Array.from(element.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join(' ').replace(/\s+/g,' ').trim();
    if(entry.mode==='price') return Array.from(element.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join('').trim();
    if(entry.mode==='list') return Array.from(element.children).map(el=>el.textContent.replace(/\s+/g,' ').trim()).filter(Boolean).join('\n');
    if(entry.mode==='inlineList') return Array.from(element.children).map(el=>el.textContent.replace(/\s+/g,' ').trim()).filter(Boolean).join('\n');
    return element.textContent.replace(/\s+/g,' ').trim();
  }
  function readStored(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')}catch{return null} }
  function readTelegramSettings(){
    const configured=document.querySelector('meta[name="guitar-vibe-leads-endpoint"]')?.content.trim()||'';
    const defaultEndpoint=configured||(!location.hostname.endsWith('github.io')?new URL('./api/telegram.php',location.href).href:'');
    try{
      const stored=JSON.parse(localStorage.getItem(TELEGRAM_SETTINGS_KEY)||'null')||{};
      const legacyId=String(stored.chatId||'').trim();
      const chatIds=(Array.isArray(stored.chatIds)?stored.chatIds:(legacyId?[legacyId]:[])).map(value=>String(value||'').trim()).filter(Boolean);
      return {endpoint:String(stored.endpoint||defaultEndpoint),adminKey:String(stored.adminKey||''),chatIds:[...new Set(chatIds)]};
    }catch{return {endpoint:defaultEndpoint,adminKey:'',chatIds:[]}}
  }
  function saveTelegramSettingsLocal(){localStorage.setItem(TELEGRAM_SETTINGS_KEY,JSON.stringify(telegramSettings))}
  function normalizeModel(source){
    const content={...defaults,...(source&&source.content||{})};
    ['desktopHeroImage','mobileHeroImage','aboutDesktopImage','aboutMobileImage'].forEach(key=>{
      if(isExpiredFigmaAsset(content[key]))content[key]=defaults[key];
    });
    entries.filter(entry=>entry.mode==='list'||entry.mode==='inlineList').forEach(entry=>{
      if(entry.key in content)content[entry.key]=splitList(content[entry.key]).join('\n');
    });
    const contacts=Array.isArray(source&&source.contacts)?source.contacts.map(contact=>{
      const preset=defaultContacts.find(item=>item.label===contact.label);
      const image=contact.image===undefined||isExpiredFigmaAsset(contact.image)?(preset?.image||''):contact.image;
      return {...contact,image};
    }):clone(defaultContacts);
    return { content, contacts, hiddenItems:{...(source&&source.hiddenItems||{})}, hiddenSections:{...(source&&source.hiddenSections||{})}, hiddenElements:{...(source&&source.hiddenElements||{})} };
  }
  function isExpiredFigmaAsset(value){return /^https:\/\/www\.figma\.com\/api\/mcp\/asset\//i.test(String(value||''))}
  function clone(value){return JSON.parse(JSON.stringify(value))}
  function splitList(value){
    return String(value||'').split(/\n|,/).map(v=>v.replace(/\s+/g,' ').trim()).filter(Boolean).reduce((items,item)=>{
      if(/^гитара$/i.test(item)&&items.length&&/^(акустическая|классическая|электро|бас)$/i.test(items[items.length-1]))items[items.length-1]+=` ${item}`;
      else items.push(item);
      return items;
    },[]);
  }
  function setText(element,value){element.textContent=String(value??'')}
  function applyEntry(entry,value){
    const elements=document.querySelectorAll(entry.selectors);
    elements.forEach(element=>{
      if(entry.attr){ if(String(value).trim()) element.setAttribute(entry.attr,String(value).trim()); return; }
      if(entry.mode==='price'){
        const textNode=Array.from(element.childNodes).find(n=>n.nodeType===Node.TEXT_NODE);
        if(textNode) textNode.textContent=`${value} `; else element.insertBefore(document.createTextNode(`${value} `),element.firstChild);
        return;
      }
      if(entry.mode==='list'){
        const isUl=element.tagName==='UL';
        const isMobile=element.classList.contains('m-tags');
        element.replaceChildren(...splitList(value).map(item=>{
          const child=document.createElement(isUl?'li':'span');
          if(!isUl) child.className=isMobile?'m-tag':'tag';
          child.textContent=item;
          return child;
        }));
        return;
      }
      if(entry.mode==='inlineList'){
        element.replaceChildren(...splitList(value).map(item=>{const span=document.createElement('span');span.textContent=item;return span}));
        return;
      }
      if(entry.mode==='textBeforeElement'){
        const textNode=Array.from(element.childNodes).find(n=>n.nodeType===Node.TEXT_NODE);
        if(textNode)textNode.textContent=`${value} `;else element.insertBefore(document.createTextNode(`${value} `),element.firstChild);return;
      }
      if(entry.mode==='siteBrand'){
        const words=String(value||'').trim().split(/\s+/).filter(Boolean);
        element.replaceChildren();
        if(!words.length)return;
        const accent=document.createElement('span');accent.className='accent';
        if(element.classList.contains('brand')){
          accent.textContent=words.shift();element.append(accent,document.createTextNode(words.length?` ${words.join(' ')}`:''));
        }else{
          const last=words.pop();element.append(document.createTextNode(words.length?`${words.join(' ')} `:''));accent.textContent=last;element.append(accent);
        }
        return;
      }
      if(entry.mode==='footerBrand'){
        const text=String(value||'');const comma=text.indexOf(',');element.replaceChildren();
        if(comma<0){setText(element,text);return}
        element.append(document.createTextNode(text.slice(0,comma+1)+' '));const accent=document.createElement('span');accent.textContent=text.slice(comma+1).trim();element.append(accent);return;
      }
      if(entry.mode==='aboutCopy'){
        const text=String(value||'');const match=text.match(/«[^»]+»/);element.replaceChildren();
        if(!match){setText(element,text);return}
        element.append(document.createTextNode(text.slice(0,match.index)));const accent=document.createElement('span');accent.className='accent';accent.textContent=match[0];element.append(accent,document.createTextNode(text.slice(match.index+match[0].length)));return;
      }
      if(entry.mode==='ctaSubtitle'){
        const text=String(value||'');const match=text.match(/бесплатно/i);element.replaceChildren();
        if(!match){setText(element,text);return}
        element.append(document.createTextNode(text.slice(0,match.index)));const strong=document.createElement('strong');strong.textContent=match[0];element.append(strong,document.createTextNode(text.slice(match.index+match[0].length)));return;
      }
      setText(element,value);
    });
    if(entry.mode==='address') updateMapLink(value);
    if(entry.mode==='phone') updateConsultPhone(value);
  }
  function applyModel(next){
    entries.forEach(entry=>applyEntry(entry,next.content[entry.key]));
    applyRepeaterVisibility(next.hiddenItems||{});
    applySectionVisibility(next.hiddenSections||{});
    applyManagedElementVisibility(next.hiddenElements||{});
    reflowMobileStage();
    renderContacts(next.contacts);
    document.title=next.content.pageTitle||'Guitar Vibe';
  }
  function applyRepeaterVisibility(hiddenItems){
    Object.entries(repeaters).forEach(([section,group])=>group.items.forEach((item,index)=>{
      const found=Array.from(document.querySelectorAll(item.selector)),targets=item.elementIndex===undefined?found:[found[item.elementIndex]].filter(Boolean);
      targets.forEach(element=>{element.style.display=hiddenItems[section]?.[index]?'none':''});
    }));
  }
  function applySectionVisibility(hiddenSections){Object.entries(publicSections).forEach(([section,selectors])=>document.querySelectorAll(selectors).forEach(element=>{element.style.display=hiddenSections[section]?'none':''}))}
  function applyManagedElementVisibility(hiddenElements){Object.entries(managedElements).forEach(([key,item])=>document.querySelectorAll(item.selector).forEach(element=>{element.style.visibility=hiddenElements[key]?'hidden':''}))}
  function reflowMobileStage(){
    const stage=document.querySelector('.mobile-stage'),wrap=document.querySelector('.mobile-stage-wrap');
    if(!stage||!wrap)return;
    if(window.innerWidth>767)return;
    const isShown=element=>element&&element.style.display!=='none';
    const visibleHeight=(listSelector,itemSelector,gap)=>{
      const list=document.querySelector(listSelector),items=list?Array.from(list.querySelectorAll(itemSelector)).filter(isShown):[];
      const height=items.reduce((sum,item)=>sum+item.offsetHeight,0)+Math.max(0,items.length-1)*gap;
      if(list)list.style.height=`${height}px`;
      return height;
    };
    const formatsList=visibleHeight('.m-format-list','.m-format-card',16);
    const howList=visibleHeight('.m-how-list','.m-how-card',16);
    const instrumentsList=visibleHeight('.m-inst-list','.m-inst',16);
    const reviewsList=visibleHeight('.m-review-list','.m-review',16);
    const pricingItems=Array.from(document.querySelectorAll('.m-price-grid .m-price-card')).filter(isShown).length;
    const pricingGrid=document.querySelector('.m-price-grid'),pricingRows=Math.ceil(pricingItems/2),pricingHeight=pricingRows?pricingRows*260+(pricingRows-1)*16:0;
    if(pricingGrid)pricingGrid.style.height=`${pricingHeight}px`;
    const sections=[
      {selector:'.m-formats',height:formatsList+101,gap:20},
      {selector:'.m-about',height:547,gap:20},
      {selector:'.m-how',height:howList+81,gap:20},
      {selector:'.m-instruments',height:instrumentsList+81,gap:20},
      {selector:'.m-reviews',height:reviewsList+81,gap:20},
      {selector:'.m-pricing',height:pricingHeight+77,gap:40},
      {selector:'.m-cta',height:175,gap:20},
      {selector:'.m-footer',height:234,gap:0}
    ];
    const general=document.querySelector('.m-hero-card'),generalVisible=isShown(general);
    let cursor=generalVisible?410:0,pendingGap=0;
    sections.forEach(section=>{
      const element=document.querySelector(section.selector);
      if(!isShown(element))return;
      cursor+=pendingGap;
      element.style.top=`${cursor}px`;
      element.style.height=`${section.height}px`;
      cursor+=section.height;
      pendingGap=section.gap;
    });
    stage.style.height=`${cursor}px`;
    wrap.dataset.contentHeight=String(cursor);
    window.syncMobileStage?.();
  }
  window.addEventListener('resize',reflowMobileStage,{passive:true});
  function updateMapLink(address){
    document.querySelectorAll('#mapAddressLink,#mobileMapLink').forEach(link=>{
      link.href=`https://yandex.by/maps/?text=${encodeURIComponent(String(address||''))}`;
      link.setAttribute('aria-label',`Открыть адрес «${address}» на Яндекс Картах`);
      link.title='Открыть на Яндекс Картах';
    });
  }
  function phoneHref(value){const normalized=String(value||'').replace(/[^\d+]/g,'');return normalized?`tel:${normalized}`:'#'}
  function updateConsultPhone(value){
    document.querySelectorAll('.cta-secondary,.m-consult').forEach(button=>{
      button.setAttribute('aria-label',`Позвонить: ${value}`);
      if(button.dataset.phoneBound)return;
      button.dataset.phoneBound='true';
      button.addEventListener('click',()=>{window.location.href=phoneHref(model.content.consultPhone)});
    });
  }
  function safeHref(contact){
    const value=String(contact.value||'').trim();
    if(contact.type==='phone')return phoneHref(value||contact.label);
    if(contact.type==='email')return `mailto:${value.replace(/^mailto:/i,'')}`;
    if(/^https?:\/\//i.test(value))return value;
    return value?`https://${value.replace(/^\/+/, '')}`:'';
  }
  function renderContacts(contacts){
    const desktop=document.querySelector('.footer-col:last-child .footer-list');
    const mobile=document.querySelector('.m-footer-col.contactcol .m-footer-list');
    [desktop,mobile].forEach((container,index)=>{
      if(!container)return;
      container.replaceChildren(...contacts.filter(c=>c.label||c.value).map(contact=>{
        const href=safeHref(contact);
        const element=document.createElement(href?'a':'span');
        element.className=index===0?'contact-generated social-link':'contact-generated m-social';
        if(href){element.href=href;if(contact.type==='link'){element.target='_blank';element.rel='noopener noreferrer'}}
        const mark=contact.image?document.createElement('img'):document.createElement('span');
        if(contact.image){mark.className='contact-image';mark.src=contact.image;mark.alt='';mark.addEventListener('error',()=>{mark.replaceWith(contactFallback(contact))},{once:true})}
        else Object.assign(mark,{className:'contact-mark',textContent:(contact.type==='phone'?'+':contact.type==='email'?'@':String(contact.label||'↗').charAt(0).toUpperCase())});
        mark.setAttribute('aria-hidden','true');
        const label=document.createElement('span');label.textContent=contact.label||contact.value;
        element.append(mark,label);return element;
      }));
    });
  }
  function contactFallback(contact){const mark=document.createElement('span');mark.className='contact-mark';mark.setAttribute('aria-hidden','true');mark.textContent=contact.type==='phone'?'+':contact.type==='email'?'@':String(contact.label||'↗').charAt(0).toUpperCase();return mark}

  function installAdminEntries(){
    document.querySelectorAll('.footer,.m-footer').forEach((footer,index)=>{
      const button=document.createElement('button');button.type='button';button.className='admin-entry';button.textContent='Администратор';button.setAttribute('aria-label','Открыть панель администратора');button.addEventListener('click',openAdmin);footer.append(button);
    });
  }
  function createOverlay(){
    overlay=document.createElement('div');overlay.className='admin-overlay';overlay.id='adminOverlay';overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML='<div class="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="adminDialogTitle"><button class="admin-close" type="button" aria-label="Закрыть админку">×</button><div id="adminRoot"></div></div>';
    document.body.append(overlay);
    overlay.querySelector('.admin-close').addEventListener('click',closeAdmin);
    overlay.addEventListener('mousedown',event=>{if(event.target===overlay)closeAdmin()});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&overlay.classList.contains('open'))closeAdmin()});
  }
  function sessionUnlocked(){try{return sessionStorage.getItem(SESSION_KEY)==='yes'}catch{return false}}
  function setSessionUnlocked(value){try{value?sessionStorage.setItem(SESSION_KEY,'yes'):sessionStorage.removeItem(SESSION_KEY)}catch{}}
  function openAdmin(){
    overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
    sessionUnlocked()?renderShell():renderLogin();
  }
  function closeAdmin(){
    if(dirty&&!window.confirm('Есть несохранённые изменения. Закрыть без сохранения?'))return;
    draft=clone(model);dirty=false;overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.body.style.overflow='';
  }
  async function hashPassword(password){
    if(window.crypto&&crypto.subtle){const data=new TextEncoder().encode(password);const digest=await crypto.subtle.digest('SHA-256',data);return Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('')}
    let hash=2166136261;for(const char of password){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}return `fallback-${hash>>>0}`;
  }
  async function validPassword(password){const stored=localStorage.getItem(PASSWORD_KEY)||await hashPassword(DEFAULT_PASSWORD);return (await hashPassword(password))===stored}
  function renderLogin(){
    const root=document.getElementById('adminRoot');
    root.innerHTML='<div class="admin-login"><div class="admin-login-card"><p class="admin-login-brand">Guitar Vibe</p><h2 id="adminDialogTitle">Вход в админку</h2><p>Введите пароль, чтобы изменить содержимое сайта.</p><form class="admin-login-form"><label class="admin-label">Пароль<input class="admin-input" name="password" type="password" inputmode="numeric" autocomplete="current-password" required></label><p class="admin-error" role="alert"></p><button class="admin-primary" type="submit">Войти</button></form></div></div>';
    const form=root.querySelector('form'),input=form.elements.password,error=root.querySelector('.admin-error');input.focus();
    form.addEventListener('submit',async event=>{event.preventDefault();const button=form.querySelector('button');button.disabled=true;button.textContent='Проверяем…';if(await validPassword(input.value)){setSessionUnlocked(true);renderShell()}else{error.textContent='Неверный пароль. Проверьте цифры и попробуйте ещё раз.';input.select();button.disabled=false;button.textContent='Войти'}});
  }
  function renderShell(){
    const root=document.getElementById('adminRoot');
    root.innerHTML=`<div class="admin-shell"><aside class="admin-sidebar"><div class="admin-sidebar-head"><strong id="adminDialogTitle">Управление сайтом</strong><span>Редактирование всех разделов</span></div><nav class="admin-nav" aria-label="Разделы админки"></nav><div class="admin-sidebar-foot">Изменения хранятся в этом браузере. Нажмите «Сохранить», чтобы применить их.</div></aside><section class="admin-workspace"><header class="admin-toolbar"><div><h2></h2><p></p></div><div class="admin-status"><span class="admin-status-dot"></span><span class="admin-status-text">Все изменения сохранены</span></div></header><main class="admin-content"></main><footer class="admin-actions"><div class="admin-actions-left"><button class="admin-danger" type="button" data-admin-action="reset">Сбросить контент</button></div><div class="admin-actions-right"><button class="admin-secondary" type="button" data-admin-action="logout">Выйти</button><button class="admin-primary" type="button" data-admin-action="save">Сохранить</button></div></footer></section></div>`;
    const nav=root.querySelector('.admin-nav');
    sections.forEach(section=>{const button=document.createElement('button');button.type='button';button.className='admin-nav-btn';button.dataset.section=section.id;button.textContent=section.title;button.addEventListener('click',()=>{currentSection=section.id;renderSection()});nav.append(button)});
    root.querySelector('[data-admin-action="save"]').addEventListener('click',saveDraft);
    root.querySelector('[data-admin-action="reset"]').addEventListener('click',resetContent);
    root.querySelector('[data-admin-action="logout"]').addEventListener('click',()=>{if(dirty&&!window.confirm('Выйти без сохранения изменений?'))return;setSessionUnlocked(false);draft=clone(model);dirty=false;renderLogin()});
    renderSection();
  }
  function renderSection(){
    const section=sections.find(item=>item.id===currentSection)||sections[0];currentSection=section.id;
    document.querySelectorAll('.admin-nav-btn').forEach(button=>button.classList.toggle('active',button.dataset.section===section.id));
    const workspace=document.querySelector('.admin-workspace');workspace.querySelector('.admin-toolbar h2').textContent=section.title;workspace.querySelector('.admin-toolbar p').textContent=section.hint;
    const content=workspace.querySelector('.admin-content');content.replaceChildren();
    const help=document.createElement('p');help.className='admin-help';help.textContent=section.hint;content.append(help);
    if(publicSections[section.id]){const hidden=Boolean(draft.hiddenSections[section.id]),toggle=document.createElement('button');toggle.type='button';toggle.className=hidden?'admin-secondary admin-section-toggle':'admin-danger admin-section-toggle';toggle.textContent=hidden?'+ Добавить блок на сайт':'Удалить блок с сайта';toggle.addEventListener('click',()=>{draft.hiddenSections[section.id]=!hidden;markDirty();renderSection()});content.append(toggle)}
    if(section.id==='footer') renderFooterEditor(content); else if(section.id==='telegram') renderTelegramEditor(content); else if(section.id==='security') renderSecurity(content); else if(repeaters[section.id])renderRepeaterEditor(content,section.id);else{renderFields(content,entries.filter(entry=>entry.section===section.id));renderManagedElements(content,section.id)}
    updateStatus();
  }
  function renderFields(container,fields){
    const grid=document.createElement('div');grid.className='admin-fields';
    fields.forEach(entry=>grid.append(createAdminField(entry)));
    if(!fields.length){const empty=document.createElement('div');empty.className='admin-empty';empty.textContent='В этом разделе пока нет полей.';grid.append(empty)}container.append(grid);
  }
  function createAdminField(entry){
    const wrap=document.createElement('div');wrap.className=`admin-field${entry.wide?' wide':''}`;
    const label=document.createElement('label');label.htmlFor=`admin-${entry.key}`;label.textContent=entry.label;
    const input=document.createElement(entry.multiline?'textarea':'input');input.className=entry.multiline?'admin-textarea':'admin-input';input.id=`admin-${entry.key}`;input.value=draft.content[entry.key]??'';
    input.addEventListener('input',()=>{draft.content[entry.key]=input.value;markDirty()});wrap.append(label,input);
    if(entry.image){
      const upload=document.createElement('label');upload.className='admin-file-button';upload.textContent='Загрузить изображение';const file=document.createElement('input');file.type='file';file.accept='image/*';file.hidden=true;upload.append(file);wrap.append(upload);
      file.addEventListener('change',async()=>{if(!file.files[0])return;upload.textContent='Обработка…';try{const data=await imageFileToDataUrl(file.files[0],entry.key.toLowerCase().includes('hero')?1600:900);draft.content[entry.key]=data;input.value=data;markDirty()}catch{window.alert('Не удалось обработать изображение. Выберите другой файл.')}finally{upload.textContent='Загрузить изображение';upload.append(file)}});
    }
    if(entry.help){const small=document.createElement('small');small.textContent=entry.help;wrap.append(small)}return wrap;
  }
  function renderManagedElements(container,section){
    const items=Object.entries(managedElements).filter(([,item])=>item.section===section);if(!items.length)return;
    const list=document.createElement('div');list.className='admin-repeat-list';items.forEach(([key,item])=>{const hidden=Boolean(draft.hiddenElements[key]),card=document.createElement('section');card.className='admin-repeat-card';const head=document.createElement('div');head.className='admin-repeat-head';const title=document.createElement('h3');title.textContent=`Управление: ${item.label}`;const toggle=document.createElement('button');toggle.type='button';toggle.className=hidden?'admin-secondary':'admin-danger';toggle.textContent=hidden?`+ Добавить ${item.label}`:`Удалить ${item.label}`;toggle.addEventListener('click',()=>{draft.hiddenElements[key]=!hidden;markDirty();renderSection()});head.append(title,toggle);card.append(head);list.append(card)});container.append(list);
  }
  function renderRepeaterEditor(container,section){
    const group=repeaters[section],allFields=entries.filter(entry=>entry.section===section),itemKeys=new Set(group.items.flatMap(item=>item.keys));
    renderFields(container,allFields.filter(entry=>!itemKeys.has(entry.key)));
    const list=document.createElement('div');list.className='admin-repeat-list';container.append(list);
    group.items.forEach((item,index)=>{
      if(draft.hiddenItems[section]?.[index])return;
      const card=document.createElement('section');card.className='admin-repeat-card';
      const head=document.createElement('div');head.className='admin-repeat-head';const title=document.createElement('h3');title.textContent=draft.content[item.keys[0]]||item.title;const remove=document.createElement('button');remove.type='button';remove.className='admin-danger';remove.textContent='Удалить';remove.addEventListener('click',()=>{setItemHidden(section,index,true);markDirty();renderSection()});head.append(title,remove);card.append(head);
      const fields=document.createElement('div');fields.className='admin-fields';item.keys.map(key=>allFields.find(entry=>entry.key===key)).filter(Boolean).forEach(entry=>fields.append(createAdminField(entry)));card.append(fields);list.append(card);
    });
    const hiddenIndex=group.items.findIndex((_,index)=>draft.hiddenItems[section]?.[index]);const add=document.createElement('button');add.type='button';add.className='admin-secondary admin-repeat-add';add.textContent=`+ Добавить ${group.itemName}`;add.disabled=hiddenIndex<0;add.title=hiddenIndex<0?'Все предусмотренные структурой позиции уже используются':'';add.addEventListener('click',()=>{if(hiddenIndex<0)return;setItemHidden(section,hiddenIndex,false);markDirty();renderSection()});list.append(add);
  }
  function setItemHidden(section,index,value){if(!draft.hiddenItems[section])draft.hiddenItems[section]=[];draft.hiddenItems[section][index]=value}
  function imageFileToDataUrl(file,maxSize=900){
    return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{const image=new Image();image.onerror=reject;image.onload=()=>{const scale=Math.min(1,maxSize/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL(file.type==='image/png'?'image/png':'image/jpeg',.84))};image.src=reader.result};reader.readAsDataURL(file)});
  }
  function renderFooterEditor(container){
    renderFields(container,entries.filter(entry=>entry.section==='footer'));
    const grid=container.querySelector('.admin-fields');
    const heading=document.createElement('div');heading.className='admin-field wide';heading.innerHTML='<label>Кликабельные контакты</label><small>Для обычной ссылки укажите полный адрес, например https://t.me/username.</small>';grid.append(heading);
    const list=document.createElement('div');list.className='admin-contact-list';grid.append(list);
    draft.contacts.forEach((contact,index)=>list.append(contactRow(contact,index)));
    const add=document.createElement('button');add.type='button';add.className='admin-secondary admin-add-contact';add.textContent='+ Добавить контакт';add.addEventListener('click',()=>{draft.contacts.push({type:'link',label:'Новый контакт',value:'',image:''});markDirty();renderSection()});list.append(add);
  }
  function contactRow(contact,index){
    const row=document.createElement('div');row.className='admin-contact-row';
    row.innerHTML=`<label class="admin-label">Тип<select class="admin-select" data-contact="type"><option value="link">Ссылка</option><option value="phone">Телефон</option><option value="email">Email</option></select></label><label class="admin-label">Название<input class="admin-input" data-contact="label"></label><label class="admin-label">Ссылка / номер<input class="admin-input" data-contact="value"></label><button class="admin-remove" type="button" aria-label="Удалить контакт">×</button><div class="admin-contact-image-row"><label class="admin-label">Изображение / иконка<input class="admin-input" data-contact="image" placeholder="Ссылка или загруженный файл"></label><label class="admin-file-button">Загрузить иконку<input type="file" accept="image/*" hidden data-contact-file></label></div>`;
    const type=row.querySelector('[data-contact="type"]'),label=row.querySelector('[data-contact="label"]'),value=row.querySelector('[data-contact="value"]'),image=row.querySelector('[data-contact="image"]');type.value=contact.type||'link';label.value=contact.label||'';value.value=contact.value||'';image.value=contact.image||'';
    [type,label,value,image].forEach(input=>input.addEventListener('input',()=>{draft.contacts[index][input.dataset.contact]=input.value;markDirty()}));
    row.querySelector('[data-contact-file]').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;const button=event.target.parentElement;button.childNodes[0].textContent='Обработка…';try{draft.contacts[index].image=await imageFileToDataUrl(file,256);image.value=draft.contacts[index].image;markDirty()}catch{window.alert('Не удалось обработать иконку.')}finally{button.childNodes[0].textContent='Загрузить иконку'}});
    row.querySelector('.admin-remove').addEventListener('click',()=>{draft.contacts.splice(index,1);markDirty();renderSection()});return row;
  }
  function renderTelegramEditor(container){
    const grid=document.createElement('div');grid.className='admin-fields';
    const card=document.createElement('section');card.className='admin-security-card admin-telegram-card';
    card.innerHTML=`<h3>Получатели заявок</h3><p>Токен Telegram-бота хранится только в закрытом PHP-конфиге. Добавьте chat_id всех аккаунтов, которым должны одновременно приходить заявки.</p><form class="admin-telegram-grid"><label class="admin-label wide">Адрес PHP-обработчика<input class="admin-input" name="endpoint" type="url" inputmode="url" autocomplete="url" placeholder="https://ваш-домен.by/api/telegram.php" required><small>На основном PHP-домене адрес подставляется автоматически.</small></label><label class="admin-label wide">Ключ подключения<input class="admin-input" name="adminKey" type="password" autocomplete="off" placeholder="Ключ из api/config.php" required><small>Это не токен бота и не пароль от админки.</small></label><div class="admin-telegram-recipients wide"><div class="admin-telegram-recipients-head"><strong>Аккаунты получателей</strong><span data-recipient-count aria-live="polite"></span></div><div class="admin-telegram-recipient-list" data-recipient-list></div><button class="admin-secondary admin-telegram-add" type="button" data-telegram-action="add">+ Добавить chat_id</button><small>Каждый аккаунт должен сначала открыть Telegram-бота и нажать Start. Можно добавить до 20 получателей.</small></div><div class="admin-telegram-actions"><button class="admin-secondary" type="button" data-telegram-action="connect">Проверить подключение</button><button class="admin-primary" type="submit">Сохранить получателей</button><button class="admin-secondary" type="button" data-telegram-action="test">Отправить тест всем</button></div></form><p class="admin-inline-message" role="status" aria-live="polite"></p>`;
    const form=card.querySelector('form'),message=card.querySelector('.admin-inline-message'),recipientList=card.querySelector('[data-recipient-list]'),recipientCount=card.querySelector('[data-recipient-count]');
    form.elements.endpoint.value=telegramSettings.endpoint;
    form.elements.adminKey.value=telegramSettings.adminKey;
    let recipientDraft=telegramSettings.chatIds.length?[...telegramSettings.chatIds]:[''];
    const validChatId=value=>/^-?\d{5,16}$/.test(value)||/^@[A-Za-z][A-Za-z0-9_]{4,31}$/.test(value);
    const updateRecipientCount=()=>{const total=recipientDraft.filter(value=>String(value||'').trim()).length;recipientCount.textContent=`Добавлено: ${total}`};
    const renderRecipients=()=>{
      recipientList.replaceChildren();
      recipientDraft.forEach((value,index)=>{
        const row=document.createElement('div');row.className='admin-telegram-recipient-row';
        row.innerHTML=`<label class="admin-label" for="telegram-chat-${index}">chat_id ${index+1}<input class="admin-input" id="telegram-chat-${index}" inputmode="text" autocomplete="off" placeholder="Например: 123456789" required></label><button class="admin-remove" type="button" aria-label="Удалить chat_id ${index+1}">×</button>`;
        const input=row.querySelector('input'),remove=row.querySelector('button');input.value=value;
        const validate=()=>{const normalized=input.value.trim();input.setCustomValidity(!normalized?'Укажите chat_id.':validChatId(normalized)?'':'Допустимы числовой chat_id или @username канала.');return input.reportValidity()};
        input.addEventListener('input',()=>{recipientDraft[index]=input.value;input.setCustomValidity('');updateRecipientCount()});
        input.addEventListener('blur',validate);
        remove.disabled=recipientDraft.length===1;remove.addEventListener('click',()=>{recipientDraft.splice(index,1);renderRecipients()});
        recipientList.append(row);
      });
      card.querySelector('[data-telegram-action="add"]').disabled=recipientDraft.length>=20;
      updateRecipientCount();
    };
    const normalizedRecipients=()=>{
      const inputs=[...recipientList.querySelectorAll('input')];let valid=true;
      inputs.forEach(input=>{const value=input.value.trim();input.setCustomValidity(!value?'Укажите chat_id.':validChatId(value)?'':'Допустимы числовой chat_id или @username канала.');if(!input.reportValidity())valid=false});
      if(!valid)throw new Error('Проверьте chat_id получателей.');
      return [...new Set(inputs.map(input=>input.value.trim()))];
    };
    const syncConnection=()=>{telegramSettings={...telegramSettings,endpoint:form.elements.endpoint.value.trim(),adminKey:form.elements.adminKey.value.trim()}};
    const sync=()=>{syncConnection();telegramSettings.chatIds=normalizedRecipients()};
    const run=async(button,work,loading,{validateRecipients=true}={})=>{message.className='admin-inline-message';message.textContent='';button.disabled=true;const old=button.textContent;button.textContent=loading;try{validateRecipients?sync():syncConnection();const success=await work();saveTelegramSettingsLocal();message.classList.add('success');message.textContent=success||'Готово.'}catch(error){message.classList.add('error');message.textContent=error?.message||'Не удалось выполнить запрос.'}finally{button.disabled=false;button.textContent=old}};
    card.querySelector('[data-telegram-action="add"]').addEventListener('click',()=>{if(recipientDraft.length>=20)return;recipientDraft.push('');renderRecipients();recipientList.lastElementChild?.querySelector('input')?.focus()});
    form.addEventListener('submit',event=>{event.preventDefault();const button=form.querySelector('[type="submit"]');run(button,async()=>{const result=await telegramApi('settings',{method:'PUT',body:{chatIds:telegramSettings.chatIds}});telegramSettings.chatIds=Array.isArray(result.chatIds)?result.chatIds:telegramSettings.chatIds;recipientDraft=[...telegramSettings.chatIds];renderRecipients();return `Получатели сохранены: ${telegramSettings.chatIds.length}.`},'Сохраняем…')});
    card.querySelector('[data-telegram-action="connect"]').addEventListener('click',event=>run(event.currentTarget,async()=>{const result=await telegramApi('settings');telegramSettings.chatIds=Array.isArray(result.chatIds)?result.chatIds:(result.chatId?[result.chatId]:[]);recipientDraft=telegramSettings.chatIds.length?[...telegramSettings.chatIds]:[''];renderRecipients();return telegramSettings.chatIds.length?`Подключение работает. Получателей: ${telegramSettings.chatIds.length}.`:'Подключение работает. Теперь добавьте chat_id.'},'Проверяем…',{validateRecipients:false}));
    card.querySelector('[data-telegram-action="test"]').addEventListener('click',event=>run(event.currentTarget,async()=>{const result=await telegramApi('test',{method:'POST'});return `Тест отправлен получателям: ${result.sent||telegramSettings.chatIds.length}.`},'Отправляем…',{validateRecipients:false}));
    renderRecipients();
    grid.append(card);container.append(grid);
  }
  async function telegramApi(action,{method='GET',body}={}){
    const endpoint=String(telegramSettings.endpoint||'').trim().replace(/\/$/,'');
    if(!/^https:\/\//i.test(endpoint))throw new Error('Укажите HTTPS-адрес обработчика.');
    if(!telegramSettings.adminKey)throw new Error('Укажите ключ подключения.');
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
    try{
      const separator=endpoint.includes('?')?'&':'?';
      const response=await fetch(`${endpoint}${separator}action=${encodeURIComponent(action)}`,{method,headers:{authorization:`Bearer ${telegramSettings.adminKey}`,...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:controller.signal});
      const result=await response.json().catch(()=>null);
      if(!response.ok||!result?.ok)throw new Error(result?.error||'Обработчик вернул ошибку.');
      return result;
    }catch(error){if(error?.name==='AbortError')throw new Error('Обработчик не ответил вовремя.');throw error}finally{clearTimeout(timeout)}
  }
  function renderSecurity(container){
    const grid=document.createElement('div');grid.className='admin-fields';
    const card=document.createElement('section');card.className='admin-security-card';card.innerHTML='<h3>Смена пароля</h3><p>Введите текущий пароль и дважды новый. Используйте не менее 4 символов.</p><form class="admin-password-grid"><label class="admin-label">Текущий пароль<input class="admin-input" name="current" type="password" autocomplete="current-password" required></label><label class="admin-label">Новый пароль<input class="admin-input" name="next" type="password" autocomplete="new-password" minlength="4" required></label><label class="admin-label">Повторите новый пароль<input class="admin-input" name="repeat" type="password" autocomplete="new-password" minlength="4" required></label><button class="admin-primary" type="submit">Сменить пароль</button></form><p class="admin-inline-message" role="status"></p>';
    const form=card.querySelector('form'),message=card.querySelector('.admin-inline-message');form.addEventListener('submit',async event=>{event.preventDefault();message.style.color='#ff9d82';if(!(await validPassword(form.elements.current.value))){message.textContent='Текущий пароль указан неверно.';return}if(form.elements.next.value.length<4){message.textContent='Новый пароль должен содержать не менее 4 символов.';return}if(form.elements.next.value!==form.elements.repeat.value){message.textContent='Новые пароли не совпадают.';return}localStorage.setItem(PASSWORD_KEY,await hashPassword(form.elements.next.value));form.reset();message.style.color='#83d2a9';message.textContent='Пароль успешно изменён.'});grid.append(card);container.append(grid);
  }
  function markDirty(){dirty=true;updateStatus()}
  function updateStatus(){
    const status=document.querySelector('.admin-status');if(!status)return;status.classList.toggle('dirty',dirty);status.classList.toggle('saved',!dirty);status.querySelector('.admin-status-text').textContent=dirty?'Есть несохранённые изменения':'Все изменения сохранены';
  }
  function saveDraft(){
    const next=clone(draft);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next))}catch{window.alert('Не удалось сохранить: изображения занимают слишком много места. Загрузите файлы меньшего размера.');return}model=next;applyModel(model);dirty=false;updateStatus();const button=document.querySelector('[data-admin-action="save"]');if(button){const old=button.textContent;button.textContent='Сохранено';setTimeout(()=>button.textContent=old,1200)}
  }
  function resetContent(){
    if(!window.confirm('Вернуть весь контент и контакты к исходным значениям?'))return;
    draft={content:{...defaults},contacts:clone(defaultContacts),hiddenItems:{},hiddenSections:{},hiddenElements:{}};model=clone(draft);localStorage.removeItem(STORAGE_KEY);applyModel(model);dirty=false;renderSection();
  }
})();
