(function(){
  // ---- presentation utilities ----
  const presentBtn = document.getElementById('presentBtn');
  const printBtn = document.getElementById('printBtn');

  presentBtn?.addEventListener('click', async ()=>{
    try {
      if(!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) {
      presentBtn.title = 'Tela cheia não disponível neste navegador';
    }
  });
  document.addEventListener('fullscreenchange', ()=>{
    if(!presentBtn) return;
    const active = Boolean(document.fullscreenElement);
    presentBtn.classList.toggle('active', active);
    presentBtn.querySelector('span').textContent = active ? 'Sair da tela cheia' : 'Apresentar';
  });
  printBtn?.addEventListener('click', ()=> window.print());

  // ---- build station rail ----
  const sections = Array.from(document.querySelectorAll('section[data-station]'));
  const railScroll = document.getElementById('railScroll');
  const readout = document.getElementById('railReadout');
  const total = sections.length;

  // ---- horizontal slide deck (hero + resumo + 14 estações + rodapé) ----
  const slidesTrackEl = document.getElementById('slidesTrack');
  const allSlides = slidesTrackEl ? Array.from(slidesTrackEl.children) : [];
  let slideIndex = 0;
  function slideIndexOf(el){ return allSlides.indexOf(el); }
  function goToSlide(i){
    slideIndex = Math.max(0, Math.min(i, allSlides.length - 1));
    if(slidesTrackEl) slidesTrackEl.style.transform = 'translateX(-' + (slideIndex * 100) + '%)';
    syncNav();
  }

  // ---- guided spotlight: the robot explains the current stage ----
  const robotGuide = document.getElementById('robotGuide');
  const robotGuideToggle = document.getElementById('robotGuideToggle');
  const robotGuideClose = document.getElementById('robotGuideClose');
  const robotGuideImage = document.getElementById('robotGuideImage');
  const robotGuideStep = document.getElementById('robotGuideStep');
  const robotGuideTitle = document.getElementById('robotGuideTitle');
  const robotGuideText = document.getElementById('robotGuideText');
  const robotGuideHelp = document.getElementById('robotGuideHelp');
  const robotGuideIntro = document.getElementById('robotGuideIntro');
  const robotGuideContent = document.getElementById('robotGuideContent');
  const robotGuideEnable = document.getElementById('robotGuideEnable');
  const robotGuideDisable = document.getElementById('robotGuideDisable');
  const robotGuideFaq = document.getElementById('robotGuideFaq');
  const robotGuideFaqTitle = document.getElementById('robotGuideFaqTitle');
  const robotGuideFaqBody = document.getElementById('robotGuideFaqBody');
  const robotGuideBack = document.getElementById('robotGuideBack');
  const robotGuidePause = document.getElementById('robotGuidePause');
  const robotGuideRestart = document.getElementById('robotGuideRestart');
  const summaryStartGuide = document.getElementById('summaryStartGuide');
  const robotGuidePrev = document.getElementById('robotGuidePrev');
  const robotGuideNext = document.getElementById('robotGuideNext');
  let guideIndex = 0;
  let guideEnabled = false;
  let guidePaused = false;
  let guideMode = 'section';
  let guideFaqTarget = null;

  const guideCopy = sections.map(sec=>({
    title: sec.querySelector('.sec-title')?.textContent.trim() || sec.dataset.label,
    text: sec.querySelector('.sec-sub')?.textContent.trim() || `Nesta etapa, entenda os pontos essenciais sobre ${sec.dataset.label.toLowerCase()}.`
  }));

  function setGuideOpen(open){
    robotGuide?.classList.toggle('open', open);
    robotGuideToggle?.setAttribute('aria-expanded', String(open));
    document.querySelectorAll('.guide-focus,.guide-faq-focus').forEach(el=>el.classList.remove('guide-focus','guide-faq-focus'));
    if(open && guideEnabled){
      if(guideMode === 'faq' && guideFaqTarget) guideFaqTarget.classList.add('guide-faq-focus');
      else sections[guideIndex]?.classList.add('guide-focus');
    }
  }
  // in-slide smooth scroll (small internal adjustments only — e.g. bringing a
  // FAQ target into view inside the slide that's already on screen)
  function scrollElementIntoView(el, align='start'){
    if(!el || !el.scrollIntoView) return;
    el.scrollIntoView({behavior: prefersReducedMotion ? 'auto' : 'smooth', block: align === 'center' ? 'center' : 'start'});
  }
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateGuide(index, scroll=false){
    guideIndex = Math.max(0, Math.min(index, total-1));
    const sec = sections[guideIndex];
    const copy = guideCopy[guideIndex];
    robotGuideStep.textContent = `ETAPA ${String(guideIndex+1).padStart(2,'0')} DE ${String(total).padStart(2,'0')}`;
    robotGuideTitle.textContent = copy.title;
    robotGuideText.textContent = copy.text;
    robotGuidePrev.disabled = guideIndex === 0;
    robotGuideNext.disabled = guideIndex === total-1;
    if(scroll) goToSlide(slideIndexOf(sec));
    if(robotGuide?.classList.contains('open')) setGuideOpen(true);
  }
  function showGuideIntro(){
    guideEnabled = false;
    guideMode = 'intro';
    robotGuideIntro.hidden = false;
    robotGuideContent.hidden = true;
    robotGuideFaq.hidden = true;
    robotGuide.classList.remove('faq-mode');
    setGuideOpen(true);
  }
  function enableGuide(){
    guideEnabled = true;
    guidePaused = false;
    guideMode = 'section';
    robotGuideIntro.hidden = true;
    robotGuideContent.hidden = false;
    robotGuideFaq.hidden = true;
    updateGuide(0,true);
    setGuideOpen(true);
  }
  robotGuideToggle?.addEventListener('click',()=>{
    if(guidePaused){
      guidePaused = false;
      guideEnabled = true;
      guideMode = 'section';
      robotGuideIntro.hidden = true;
      robotGuideFaq.hidden = true;
      robotGuideContent.hidden = false;
      setGuideOpen(true);
    }
    else if(!robotGuide.classList.contains('open') && !guideEnabled) showGuideIntro();
    else setGuideOpen(!robotGuide.classList.contains('open'));
  });
  robotGuideClose?.addEventListener('click',()=>setGuideOpen(false));
  robotGuideEnable?.addEventListener('click',enableGuide);
  robotGuideDisable?.addEventListener('click',()=>setGuideOpen(false));
  summaryStartGuide?.addEventListener('click',enableGuide);
  robotGuidePause?.addEventListener('click',()=>{
    guidePaused = true;
    guideEnabled = false;
    setGuideOpen(false);
    robotGuideToggle.title = 'Retomar guia';
  });
  robotGuideRestart?.addEventListener('click',enableGuide);
  robotGuidePrev?.addEventListener('click',()=>updateGuide(guideIndex-1,true));
  robotGuideNext?.addEventListener('click',()=>updateGuide(guideIndex+1,true));
  robotGuideHelp?.addEventListener('click',()=>{
    const helpButton = sections[guideIndex]?.querySelector('.info-btn[data-faq]');
    setGuideOpen(false);
    helpButton?.click();
  });
  function showFaqInGuide(target, faqId, title){
    const panel = document.getElementById(faqId);
    const inner = panel?.querySelector('.faq-inner');
    if(!inner) return;
    guideEnabled = true;
    guideMode = 'faq';
    guideFaqTarget = target;
    robotGuideIntro.hidden = true;
    robotGuideContent.hidden = true;
    robotGuideFaq.hidden = false;
    robotGuideFaqTitle.textContent = title || 'Dúvidas desta etapa';
    robotGuideFaqBody.innerHTML = inner.innerHTML;
    robotGuide.classList.add('faq-mode');
    target.scrollIntoView && scrollElementIntoView(target,'center');
    setGuideOpen(true);
  }
  robotGuideBack?.addEventListener('click',()=>{
    guideMode = 'section';
    guideFaqTarget = null;
    robotGuideFaq.hidden = true;
    robotGuideContent.hidden = false;
    robotGuide.classList.remove('faq-mode');
    updateGuide(guideIndex,true);
    setGuideOpen(true);
  });
  updateGuide(0);

  sections.forEach(sec=>{
    const wrap = document.createElement('div');
    wrap.className = 'rail-dot-wrap';
    const btn = document.createElement('button');
    btn.className = 'rail-dot';
    btn.setAttribute('data-target', sec.id);
    btn.setAttribute('aria-label', sec.dataset.label);
    const label = document.createElement('span');
    label.className = 'rail-label';
    label.textContent = sec.dataset.station + ' · ' + sec.dataset.label.toUpperCase();
    btn.addEventListener('click', ()=> goToSlide(slideIndexOf(sec)));
    wrap.appendChild(btn);
    wrap.appendChild(label);
    railScroll.appendChild(wrap);
  });
  const dots = Array.from(document.querySelectorAll('.rail-dot'));

  // ---- mobile nav list ----
  const mobileNavList = document.getElementById('mobileNavList');
  const mobileNavBtn = document.getElementById('mobileNavBtn');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');
  const mobileNavClose = document.getElementById('mobileNavClose');
  const mobileNavReadout = document.getElementById('mobileNavReadout');

  sections.forEach(sec=>{
    const item = document.createElement('button');
    item.className = 'mobile-nav-item';
    item.dataset.target = sec.id;
    item.innerHTML = '<span class="st">' + sec.dataset.station + '</span><span>' + sec.dataset.label + '</span>';
    item.addEventListener('click', ()=>{
      closeMobileNav();
      setTimeout(()=> goToSlide(slideIndexOf(sec)), 200);
    });
    mobileNavList.appendChild(item);
  });
  const mobileNavItems = Array.from(document.querySelectorAll('.mobile-nav-item'));

  function openMobileNav(){ mobileNavOverlay.classList.add('open'); }
  function closeMobileNav(){ mobileNavOverlay.classList.remove('open'); }
  mobileNavBtn.addEventListener('click', openMobileNav);
  mobileNavClose.addEventListener('click', closeMobileNav);
  mobileNavOverlay.addEventListener('click', (e)=>{ if(e.target === mobileNavOverlay) closeMobileNav(); });

  // ---- progress bar + active section (driven by slideIndex, not scroll) ----
  const fill = document.getElementById('progressFill');
  const toTop = document.getElementById('toTop');

  function syncNav(){
    const max = allSlides.length - 1;
    fill.style.width = (max>0 ? (slideIndex/max*100) : 0) + '%';
    toTop.classList.toggle('show', slideIndex > 0);

    dots.forEach((d,i)=>{
      const secSlideIdx = slideIndexOf(sections[i]);
      d.classList.toggle('done', secSlideIdx < slideIndex);
      d.classList.toggle('active', secSlideIdx === slideIndex);
      const wrap = d.parentElement;
      if(wrap){
        wrap.classList.toggle('done', secSlideIdx < slideIndex);
        wrap.classList.toggle('current', secSlideIdx === slideIndex);
      }
    });

    const stationIdx = sections.indexOf(allSlides[slideIndex]);
    if(stationIdx >= 0){
      readout.textContent = String(stationIdx+1).padStart(2,'0') + ' / ' + String(total).padStart(2,'0');
      mobileNavReadout.textContent = String(stationIdx+1).padStart(2,'0') + '/' + String(total).padStart(2,'0');
      mobileNavItems.forEach((it,i)=> it.classList.toggle('active', i===stationIdx));
      if(stationIdx !== guideIndex) updateGuide(stationIdx);
    }
  }
  goToSlide(0);

  toTop.addEventListener('click', ()=> goToSlide(0));

  // ---- per-topic info popups ----
  const TOPIC_DATA = {
    'sem-grupos': {
      icon: '👥',
      title: 'Conversas individuais',
      body: 'Não ser possível participar ou criar grupos é uma das regras estabelecidas pela própria Meta para a API Oficial. Porém, com a IP Solution é possível criar grupos internos ou utilizar o recurso de "sussurro" para adicionar vários colaboradores a uma mesma conversa, sem que o cliente perceba a troca de atendente.'
    },
    'resposta-cliente': {
      icon: '⏱',
      title: 'Interação do cliente',
      body: 'A janela de 24 horas só abre depois que o cliente responde ao template. Na plataforma da IP Solution é possível visualizar quanto tempo falta para esse prazo se esgotar, ajudando a equipe a se organizar antes que a janela feche.'
    },
    'sem-edicao': {
      icon: '✎',
      title: 'Mensagens preservadas',
      body: 'Mensagens enviadas não podem ser editadas ou apagadas depois do envio — essa também é uma regra definida diretamente pela Meta, válida para todos os BSPs, e não algo específico da IP Solution.'
    },
    'cobrancas': {
      icon: '$',
      title: 'Valores definidos pela Meta',
      body: 'Os valores são definidos e cobrados diretamente pela Meta, de acordo com a categoria da mensagem enviada. A IP Solution não define nem adiciona qualquer margem sobre essas cobranças.'
    },
    'limites-envio': {
      icon: '📈',
      title: 'Capacidade de envio',
      body: 'Os limites diários de envio são definidos automaticamente pela Meta, conforme a qualidade e a reputação do número. Manter boas práticas de envio ajuda a aumentar esses limites com o tempo.'
    },
    'historico-conversas': {
      icon: '📄',
      title: 'Histórico de conversas',
      body: 'Veja a seção "Reinício do histórico de conversas", logo a seguir, para entender por que isso acontece e como se preparar para a migração.'
    },
    'documentacao': {
      icon: '💼',
      title: 'Documentação empresarial',
      body: 'É por meio desses dados que a Meta valida se a empresa está regularizada e com todas as informações cadastrais corretas antes de liberar o uso da API Oficial.'
    },
    'presenca-digital-crit': {
      icon: '🌐',
      title: 'Presença digital',
      body: 'As verificações empresariais da Meta são feitas consultando o site institucional e as páginas oficiais da empresa — por isso é importante que essas informações estejam atualizadas e consistentes entre os canais.'
    },
    'contato-financeiro': {
      icon: '💳',
      title: 'Contato e financeiro',
      body: 'Telefone e e-mail corporativo podem ser usados pela Meta para possíveis verificações, como o envio de um código de confirmação. Já o cartão Visa ou Mastercard é usado para a cobrança das mensagens, debitado automaticamente conforme a cotação vigente.'
    },
    'acesso-verificacao': {
      icon: '🔒',
      title: 'Acesso e verificação',
      body: 'Esses itens são necessários porque deixam o Portfólio Empresarial mais seguro e completo, liberando o uso pleno da API Oficial junto à Meta.'
    }
  };

  const topicModalOverlay = document.getElementById('topicModalOverlay');
  const topicModalIcon = document.getElementById('topicModalIcon');
  const topicModalTitle = document.getElementById('topicModalTitle');
  const topicModalBody = document.getElementById('topicModalBody');
  const topicModalClose = document.getElementById('topicModalClose');

  function openTopicModal(key){
    const data = TOPIC_DATA[key];
    if(!data) return;
    setGuideOpen(false);
    topicModalIcon.textContent = data.icon;
    topicModalTitle.textContent = data.title;
    topicModalBody.textContent = data.body;
    topicModalOverlay.classList.add('open');
  }
  function closeTopicModal(){
    topicModalOverlay.classList.remove('open');
  }
  document.querySelectorAll('.topic-info-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      openTopicModal(btn.dataset.topic);
    });
  });
  topicModalClose.addEventListener('click', closeTopicModal);
  topicModalOverlay.addEventListener('click', (e)=>{ if(e.target === topicModalOverlay) closeTopicModal(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeTopicModal(); });

  // ---- robot FAQ pop-up (modal) ----
  const faqModalOverlay = document.getElementById('faqModalOverlay');
  const faqModalBody = document.getElementById('faqModalBody');
  const faqModalTitle = document.getElementById('faqModalTitle');
  const faqModalMascot = document.getElementById('faqModalMascot');
  const faqModalClose = document.getElementById('faqModalClose');

  function openFaqModal(faqId, mascotSrc, title){
    const panel = document.getElementById(faqId);
    if(!panel) return;
    setGuideOpen(false);
    const inner = panel.querySelector('.faq-inner');
    faqModalBody.innerHTML = inner ? inner.innerHTML : '';
    faqModalTitle.textContent = title || 'Dúvidas frequentes';
    if(mascotSrc) faqModalMascot.src = mascotSrc;
    faqModalOverlay.classList.add('open');
  }
  function closeFaqModal(){ faqModalOverlay.classList.remove('open'); }
  faqModalClose.addEventListener('click', closeFaqModal);
  faqModalOverlay.addEventListener('click', (e)=>{ if(e.target === faqModalOverlay) closeFaqModal(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeFaqModal(); });

  // ---- arrow-key / on-screen navigation between sections ----
  function anyOverlayOpen(){
    return topicModalOverlay.classList.contains('open')
      || faqModalOverlay.classList.contains('open')
      || mobileNavOverlay.classList.contains('open');
  }
  function goToSection(delta){
    goToSlide(slideIndex + delta);
  }
  document.addEventListener('keydown', (e)=>{
    if(anyOverlayOpen()) return;
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if(tag === 'INPUT' || tag === 'TEXTAREA') return;
    if(e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown'){
      e.preventDefault(); goToSection(1);
    } else if(e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp'){
      e.preventDefault(); goToSection(-1);
    }
  });
  const sectionNavUp = document.getElementById('sectionNavUp');
  const sectionNavDown = document.getElementById('sectionNavDown');
  sectionNavUp?.addEventListener('click', ()=> goToSection(-1));
  sectionNavDown?.addEventListener('click', ()=> goToSection(1));

  // ---- wheel & touch-swipe navigation between slides ----
  // lets normal vertical scroll happen inside a tall slide first; only
  // switches slides once the user is at the top/bottom edge and keeps going
  let wheelCooldown = false;
  document.addEventListener('wheel', (e)=>{
    if(anyOverlayOpen()) return;
    const activeSlide = allSlides[slideIndex];
    if(!activeSlide) return;
    const vertical = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
    let dir = 0;
    if(vertical){
      if(Math.abs(e.deltaY) < 18) return;
      const atTop = activeSlide.scrollTop <= 2;
      const atBottom = activeSlide.scrollTop + activeSlide.clientHeight >= activeSlide.scrollHeight - 2;
      if(e.deltaY > 0 && atBottom) dir = 1;
      else if(e.deltaY < 0 && atTop) dir = -1;
      else return;
    } else {
      if(Math.abs(e.deltaX) < 18) return;
      dir = e.deltaX > 0 ? 1 : -1;
    }
    if(wheelCooldown) return;
    wheelCooldown = true;
    goToSlide(slideIndex + dir);
    setTimeout(()=> wheelCooldown = false, 650);
  }, {passive:true});

  let touchStartX = 0, touchStartY = 0;
  document.addEventListener('touchstart', (e)=>{
    if(anyOverlayOpen()) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, {passive:true});
  document.addEventListener('touchend', (e)=>{
    if(anyOverlayOpen()) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if(Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy)) return;
    goToSlide(slideIndex + (dx < 0 ? 1 : -1));
  }, {passive:true});

  // ---- clickable page index (página Objetivo) ----
  document.querySelector('.skip-link')?.addEventListener('click', (e)=>{
    e.preventDefault();
    const target = document.getElementById('objetivo');
    if(target){ goToSlide(slideIndexOf(target)); target.focus?.(); }
  });

  document.querySelectorAll('.page-index-item').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = document.getElementById(btn.dataset.target);
      if(target) goToSlide(slideIndexOf(target));
    });
  });

  // Imagem do Jadibô: embutida em base64 UMA única vez no HTML (#jadiboSrc),
  // em vez de repetida nas 14 seções. Todos os robôs saem desta fonte.
  const jadiboEl = document.getElementById('jadiboSrc');
  const jadiboSrc = jadiboEl ? jadiboEl.getAttribute('src') : '';

  // O botão flutuante do assistente (robotGuideImage) apontava para um arquivo
  // externo (assets/jadibo-guia.gif) que nem sempre acompanha o pacote.
  // Passa a usar a mesma imagem embutida em base64 (#jadiboSrc), garantindo
  // que o assistente sempre apareça, mesmo sem a pasta assets/.
  if (jadiboSrc && robotGuideImage) {
    robotGuideImage.src = jadiboSrc;
  }

  // ---- info robots: top button + a larger generated bottom button both open the pop-up ----
  document.querySelectorAll('.info-btn').forEach(btn=>{
    const section = btn.closest('section');
    const faqId = btn.dataset.faq;
    const mascotImg = btn.querySelector('.mascot-icon');
    // usa a fonte única; cai para o src do próprio botão se ele existir
    const mascotSrc = jadiboSrc || (mascotImg ? mascotImg.getAttribute('src') : '');
    const titleEl = section ? section.querySelector('.sec-title') : null;
    const title = titleEl ? titleEl.textContent.trim() : 'Dúvidas frequentes';

    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', ()=> showFaqInGuide(btn, faqId, title));

    if(section && mascotSrc){
      // a section can redirect its Jadibô elsewhere via data-jadibo-slot
      // (the last section mounts it in the footer row, beside the BSP line)
      const slot = section.dataset.jadiboSlot ? document.getElementById(section.dataset.jadiboSlot) : null;
      const wrap = slot || section.querySelector('.wrap') || section;
      const bottom = document.createElement('button');
      bottom.type = 'button';
      bottom.className = 'info-btn-bottom' + (section.classList.contains('dark') ? ' on-dark' : '');
      bottom.setAttribute('aria-label', 'Abrir dúvidas frequentes');
      const bimg = document.createElement('img');
      bimg.src = mascotSrc;
      bimg.alt = 'Robô de dúvidas';
      const label = document.createElement('span');
      label.className = 'robo-label';
      label.innerHTML = 'Ficou com dúvidas? <b>Clique no Jadibô</b>';
      bottom.appendChild(bimg);
      bottom.appendChild(label);
      bottom.addEventListener('click', ()=> showFaqInGuide(bottom, faqId, title));
      wrap.appendChild(bottom);
    }
  });

  // ---- info carousels (client pages through the cards with prev/next) ----
  document.querySelectorAll('[data-carousel]').forEach(car=>{
    const track = car.querySelector('.carousel-track');
    const slides = Array.from(car.querySelectorAll('.carousel-slide'));
    const prev = car.querySelector('[data-dir="prev"]');
    const next = car.querySelector('[data-dir="next"]');
    const dotsWrap = car.querySelector('.carousel-dots');
    const curEl = car.querySelector('.carousel-counter .cur');
    const totEl = car.querySelector('.carousel-counter .tot');
    if(!track || slides.length === 0) return;
    let idx = 0;
    if(totEl) totEl.textContent = slides.length;

    const dots = slides.map((_, i)=>{
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'carousel-dot';
      d.setAttribute('aria-label', 'Ir para o item ' + (i + 1));
      d.addEventListener('click', ()=> go(i));
      if(dotsWrap) dotsWrap.appendChild(d);
      return d;
    });

    function go(i){
      idx = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      dots.forEach((d, k)=> d.classList.toggle('active', k === idx));
      if(curEl) curEl.textContent = idx + 1;
      const activeCard = slides[idx].firstElementChild;
      if(activeCard){
        activeCard.classList.remove('carousel-card-enter');
        void activeCard.offsetWidth; // force reflow so the animation restarts every time
        activeCard.classList.add('carousel-card-enter');
      }
    }
    if(prev) prev.addEventListener('click', ()=> go(idx - 1));
    if(next) next.addEventListener('click', ()=> go(idx + 1));
    go(0);
  });

  // ---- scroll reveal ----
  const revealSelectors = [
    '.kicker', '.sec-title', '.sec-sub',
    '.card', '.cat-card', '.stat-card', '.crit-card', '.step',
    '.chart-card', '.callout', '.banner-point', '.ba-card', '.tip-card',
    '.howto', '.risk-col', '.col-official', '.col-unofficial', '.phone',
    '.compare > *'
  ];
  const revealEls = Array.from(document.querySelectorAll(revealSelectors.join(',')))
    .filter(el=> !el.closest('.info-carousel')); // carousel slides manage their own visibility
  revealEls.forEach(el=>{
    if(el.closest('.hero')) return; // hero content animates on load, not on scroll
    el.classList.add('reveal');
  });
  // stagger siblings inside the same grid/parent
  const parents = new Set(revealEls.map(el=>el.parentElement));
  parents.forEach(parent=>{
    let i = 0;
    Array.from(parent.children).forEach(child=>{
      if(child.classList && child.classList.contains('reveal')){
        child.style.setProperty('--rd', Math.min(i,6)*70 + 'ms');
        i++;
      }
    });
  });

  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.12, rootMargin:'0px 0px -60px 0px'});
    document.querySelectorAll('.reveal').forEach(el=> io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el=> el.classList.add('in'));
  }

  // ---- animated hero stat counters ----
  const hstats = document.querySelectorAll('.hstat b');
  function animateCounters(){
    hstats.forEach(el=>{
      const raw = el.textContent.trim();
      const match = raw.match(/^(\d+)(.*)$/);
      if(!match) return;
      const target = parseInt(match[1], 10);
      const suffix = match[2] || '';
      const dur = 1100;
      const start = performance.now();
      function tick(now){
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if(p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  const heroEl = document.getElementById('hero');
  if(heroEl && 'IntersectionObserver' in window){
    const heroIo = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){ animateCounters(); heroIo.disconnect(); }
      });
    }, {threshold:.4});
    heroIo.observe(heroEl);
  } else {
    animateCounters();
  }

  // ---- charts ----
  function initCharts(){
    if(typeof Chart === 'undefined'){
      document.querySelectorAll('.chart-wrap').forEach(el=> el.classList.add('chart-unavailable'));
      return;
    }
    Chart.defaults.font.family = "'IBM Plex Sans', sans-serif";

    const alcadaEl = document.getElementById('chartAlcada');
    if(alcadaEl){
      new Chart(alcadaEl, {
        type:'doughnut',
        data:{
          labels:['Definido pela Meta'],
          datasets:[{data:[100], backgroundColor:['#FF6A13'], borderWidth:0}]
        },
        options:{
          cutout:'0%',
          plugins:{
            legend:{labels:{color:'#E6EDF9', font:{size:14.4}, boxWidth:12, padding:16}},
            tooltip:{callbacks:{label:(ctx)=> ctx.label + ': 100%'}}
          }
        }
      });
    }

    const rampEl = document.getElementById('chartRamp');
    if(rampEl){
      new Chart(rampEl, {
        type:'line',
        data:{
          labels:['Dia 1','Dia 2','Dia 3','Dia 4','Dia 5','Dia 6','Dia 7','Dia 8','Dia 9','Dia 10'],
          datasets:[{
            label:'Volume sugerido',
            data:[5,9,15,22,32,45,60,80,105,140],
            borderColor:'#FF6A13',
            backgroundColor:'rgba(255,106,19,.12)',
            fill:true, tension:.4, borderWidth:2.5,
            pointRadius:3, pointBackgroundColor:'#0B2545'
          }]
        },
        options:{
          plugins:{legend:{display:false}},
          scales:{
            x:{grid:{display:false}, ticks:{color:'#5B6472', font:{size:13.1}}},
            y:{grid:{color:'#E1E6EE'}, ticks:{color:'#5B6472', font:{size:13.1}}}
          }
        }
      });
    }
  }
  if(typeof Chart !== 'undefined'){ initCharts(); }
  else { window.addEventListener('load', initCharts); }
  
})();
