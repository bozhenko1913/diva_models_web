/* ============================================================================
   DIVA MODELS — script for the blog listing and article pages
   ============================================================================
   Only what those pages actually need: the mobile menu and the apply modal.
   No entrance animation — blog content renders immediately. The main page
   keeps its own inline script, which also drives the calculator, lightbox,
   marquee and counters, none of which exist here. Every lookup is guarded so
   a missing element is a no-op rather than a thrown error that kills the
   rest of the file.
   ============================================================================ */
(function(){
  'use strict';

  // --- Mobile menu ---------------------------------------------------------
  const menuBtn = document.getElementById('menu-btn');
  const menuClose = document.getElementById('menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  if(menuBtn && mobileMenu) menuBtn.addEventListener('click', () => mobileMenu.classList.remove('hidden-menu'));
  if(menuClose && mobileMenu) menuClose.addEventListener('click', () => mobileMenu.classList.add('hidden-menu'));
  document.querySelectorAll('.mobile-link').forEach(el =>
    el.addEventListener('click', () => { if(mobileMenu) mobileMenu.classList.add('hidden-menu'); }));

  // --- Apply modal ---------------------------------------------------------
  // Same contract as the main page: apply-form.html is re-fetched on every
  // open so any tracking pixel in that file fires per view, not per page load.
  const applyModal = document.getElementById('apply-modal');
  const applyModalContent = document.getElementById('apply-modal-content');
  let applyLastFocused = null;

  function runInjectedScripts(container){
    container.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      [...oldScript.attributes].forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });
  }

  async function openApplyModal(){
    if(!applyModal || !applyModalContent) return;
    applyLastFocused = document.activeElement;
    if(mobileMenu) mobileMenu.classList.add('hidden-menu');
    applyModal.classList.add('open');
    applyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    applyModalContent.innerHTML = '<div class="py-20 text-center text-[var(--text-dim)] text-sm">Загрузка формы…</div>';
    try{
      const res = await fetch('apply-form.html', { cache: 'no-store' });
      if(!res.ok) throw new Error('fetch failed');
      applyModalContent.innerHTML = await res.text();
      runInjectedScripts(applyModalContent);
      // форма подгружается уже после загрузки страницы, поэтому язык к ней
      // нужно применить отдельно
      if(typeof window.setLanguage === 'function'){
        var saved = 'ru';
        try { saved = localStorage.getItem('diva_lang') || 'ru'; } catch(e){}
        window.setLanguage(saved);
      }
    }catch(err){
      applyModalContent.innerHTML = '<div class="py-20 text-center"><p class="text-[var(--text-dim)] text-sm">Не удалось загрузить форму. Напишите нам напрямую:</p><a href="https://t.me/diva_modelss" target="_blank" rel="noopener" class="btn btn-primary mt-6 inline-flex">Написать в Telegram</a></div>';
    }
  }

  function closeApplyModal(){
    if(!applyModal) return;
    applyModal.classList.remove('open');
    applyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if(applyLastFocused) applyLastFocused.focus();
  }

  document.querySelectorAll('[data-open-apply]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); openApplyModal(); });
  });
  if(applyModal){
    // Delegated so it also catches the close button inside injected content
    applyModal.addEventListener('click', (e) => { if(e.target.closest('[data-modal-close]')) closeApplyModal(); });
    applyModal.querySelectorAll('[data-modal-dismiss]').forEach(el =>
      el.addEventListener('click', (e) => { if(e.target === e.currentTarget) closeApplyModal(); }));
    window.addEventListener('keydown', (e) => { if(e.key === 'Escape' && applyModal.classList.contains('open')) closeApplyModal(); });
  }

  // Note: no scroll-reveal here. The blog and article pages render their
  // content immediately — the .reveal classes were stripped from their
  // markup, so there is nothing to observe. The main page keeps its own
  // reveal animation in its inline script.
})();
