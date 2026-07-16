(function(){
  // ---- build station rail ----
  const sections = Array.from(document.querySelectorAll('section[data-station]'));
  const railScroll = document.getElementById('railScroll');
  const readout = document.getElementById('railReadout');
  const total = sections.length;

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
    btn.addEventListener('click', ()=> sec.scrollIntoView({behavior:'smooth'}));
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
      setTimeout(()=> sec.scrollIntoView({behavior:'smooth'}), 200);
    });
    mobileNavList.appendChild(item);
  });
  const mobileNavItems = Array.from(document.querySelectorAll('.mobile-nav-item'));

  function openMobileNav(){ mobileNavOverlay.classList.add('open'); }
  function closeMobileNav(){ mobileNavOverlay.classList.remove('open'); }
  mobileNavBtn.addEventListener('click', openMobileNav);
  mobileNavClose.addEventListener('click', closeMobileNav);
  mobileNavOverlay.addEventListener('click', (e)=>{ if(e.target === mobileNavOverlay) closeMobileNav(); });

  // ---- scroll progress + active section ----
  const fill = document.getElementById('progressFill');
  const toTop = document.getElementById('toTop');

  function onScroll(){
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    fill.style.width = (max>0 ? (scrolled/max*100) : 0) + '%';
    toTop.classList.toggle('show', scrolled > 700);

    let activeIdx = 0;
    sections.forEach((sec,i)=>{
      const r = sec.getBoundingClientRect();
      if(r.top < window.innerHeight*0.5) activeIdx = i;
    });
    dots.forEach((d,i)=> d.classList.toggle('active', i===activeIdx));
    readout.textContent = String(activeIdx+1).padStart(2,'0') + ' / ' + String(total).padStart(2,'0');
    mobileNavReadout.textContent = String(activeIdx+1).padStart(2,'0') + '/' + String(total).padStart(2,'0');
    mobileNavItems.forEach((it,i)=> it.classList.toggle('active', i===activeIdx));
  }
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  toTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

  // ---- FAQ toggles ----
  document.querySelectorAll('.info-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const panel = document.getElementById(btn.dataset.faq);
      const willOpen = !panel.classList.contains('open');
      panel.classList.toggle('open', willOpen);
      btn.classList.toggle('active', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
    });
  });

  // ---- scroll reveal ----
  const revealSelectors = [
    '.kicker', '.sec-title', '.sec-sub',
    '.card', '.cat-card', '.stat-card', '.crit-card', '.step',
    '.chart-card', '.callout', '.banner-point', '.ba-card', '.tip-card',
    '.howto', '.risk-col', '.col-official', '.col-unofficial', '.phone',
    '.compare > *'
  ];
  const revealEls = Array.from(document.querySelectorAll(revealSelectors.join(',')));
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
    if(typeof Chart === 'undefined') return;
    Chart.defaults.font.family = "'IBM Plex Sans', sans-serif";

    const alcadaEl = document.getElementById('chartAlcada');
    if(alcadaEl){
      new Chart(alcadaEl, {
        type:'doughnut',
        data:{
          labels:['Definido pela Meta','Alçada da IP Solution'],
          datasets:[{data:[100,0.001], backgroundColor:['#FF6A13','#1565D8'], borderWidth:0, spacing:2}]
        },
        options:{
          cutout:'72%',
          plugins:{
            legend:{labels:{color:'#E6EDF9', font:{size:11.5}, boxWidth:12, padding:16}},
            tooltip:{callbacks:{label:(ctx)=> ctx.label + ': ' + (ctx.dataIndex===0?'100%':'0%')}}
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
            x:{grid:{display:false}, ticks:{color:'#5B6472', font:{size:10.5}}},
            y:{grid:{color:'#E1E6EE'}, ticks:{color:'#5B6472', font:{size:10.5}}}
          }
        }
      });
    }
  }
  if(typeof Chart !== 'undefined'){ initCharts(); }
  else { window.addEventListener('load', initCharts); }
})();