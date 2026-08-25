/* ============================================================================
   DIVA MODELS — переключатель языка RU / UA
   ============================================================================
   Как это устроено: у каждого переводимого элемента есть class="lang" и два
   атрибута — data-ru и data-ua. Скрипт просто подставляет нужный.

   Выбор запоминается в localStorage под ключом diva_lang, поэтому язык
   держится при переходе по страницам.

   Чтобы перевести новый текст на странице:
       <p class="lang" data-ru="Привет" data-ua="Привіт">Привет</p>
   ============================================================================ */
(function(){
  'use strict';

  var KEY = 'diva_lang';
  var DEFAULT = 'ru';

  function applyLanguage(lang){
    if(lang !== 'ru' && lang !== 'ua') lang = DEFAULT;

    document.querySelectorAll('.lang').forEach(function(el){
      var value = el.getAttribute('data-' + lang);
      if(value !== null) el.innerHTML = value;
    });

    // плейсхолдеры в формах меняются отдельно — у них нет внутреннего текста
    document.querySelectorAll('[data-ph-ru]').forEach(function(el){
      var value = el.getAttribute('data-ph-' + lang);
      if(value !== null) el.setAttribute('placeholder', value);
    });

    // заголовок вкладки и язык документа
    var titleEl = document.querySelector('title[data-' + lang + ']');
    if(titleEl) document.title = titleEl.getAttribute('data-' + lang);
    document.documentElement.setAttribute('lang', lang === 'ua' ? 'uk' : 'ru');

    document.querySelectorAll('.lang-btn').forEach(function(btn){
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
    });

    try { localStorage.setItem(KEY, lang); } catch(e){ /* приватный режим */ }
  }

  // глобально — чтобы работал onclick в разметке
  window.setLanguage = applyLanguage;

  function init(){
    var saved = DEFAULT;
    try { saved = localStorage.getItem(KEY) || DEFAULT; } catch(e){}
    applyLanguage(saved);

    document.querySelectorAll('.lang-btn').forEach(function(btn){
      btn.addEventListener('click', function(){ applyLanguage(btn.getAttribute('data-lang')); });
      btn.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); applyLanguage(btn.getAttribute('data-lang')); }
      });
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
