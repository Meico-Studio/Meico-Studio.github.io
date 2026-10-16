/* ==========================================================================
   SCRIPT.JS — Meico Studio portfolio gallery, featured-work home and project
   pages. Content comes from js/data.js.
   ========================================================================== */
(() => {
  'use strict';
  const S = window.SITE;
  if (!S) return;

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce   = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(n).padStart(2, '0');
  const featured = $('#featured');
  const featuredStage = $('#featured-stage');
  const menu = $('#menu-overlay');
  const menuToggle = $('#menu-toggle');
  const topLabel = $('#top-label');
  let featureIndex = 0, featureRevision = 0;

  function setMenu(open) {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
  }
  function navigate(hash) {
    setMenu(false);
    if (hash === '#work-grid') {
      if (location.hash === '#/portfolio') route();
      else location.hash = '#/portfolio';
      return;
    }
    if (location.hash === hash) { route(); return; }
    const curtain = $('.page-transition');
    curtain.classList.remove('play');
    void curtain.offsetWidth;
    curtain.classList.add('play');
    setTimeout(() => { location.hash = hash; }, 260);
  }
  menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  $$('.menu-overlay nav a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); navigate(a.getAttribute('href')); }));
  $('.brand').addEventListener('click', e => { e.preventDefault(); navigate('#/portfolio'); });
  $('.project-scroll').addEventListener('click', e => {
    e.preventDefault();
    $('#project-story').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Placeholder art (live SVG motion until a video exists) ---------- */
  const shield = '<path class="st" d="M80 12 L113 23 V46 C113 64 98 76 80 82 C62 76 47 64 47 46 V23 Z"/>';
  const ART = {
    odometer: `<svg viewBox="0 0 160 90"><rect class="st" x="38" y="22" width="84" height="46" rx="5"/>
      <svg x="44" y="27" width="72" height="36" overflow="hidden">${[12, 36, 60].map((x, i) =>
        `<g class="col c${i + 1}">${[0, 1, 2, 3, 4].map(n => `<text class="num ink" x="${x}" y="${28 + n * 36}">${n}</text>`).join('')}</g>`).join('')}</svg></svg>`,
    icons: `<svg viewBox="0 0 160 90">${[0, 1, 2, 3].map(i => `<g class="pop fb" style="--i:${i}">
      <rect class="st" x="${22 + i * 32}" y="31" width="26" height="28" rx="5"/>
      ${['<circle class="ac" cx="35" cy="45" r="6"/>', '<path class="st" d="M61 53 L67 38 L73 53 Z"/>', '<path class="st" d="M93 40v10M99 37v13M105 43v7"/>', '<circle class="st" cx="131" cy="45" r="6"/>'][i]}</g>`).join('')}</svg>`,
    gear: `<svg viewBox="0 0 160 90">${shield}<g class="spin"><circle class="st" cx="80" cy="47" r="13" stroke-width="6" stroke-dasharray="5.1 5.1"/><circle class="st" cx="80" cy="47" r="9"/><circle class="ac" cx="80" cy="47" r="3.5"/></g></svg>`,
    bolt: `<svg viewBox="0 0 160 90">${shield}<path class="ac pulse" d="M85 28 L70 51 H80 L75 66 L92 42 H82 Z"/></svg>`,
    code: `<svg viewBox="0 0 160 90"><rect class="st" x="28" y="16" width="104" height="58" rx="5"/><path class="st" d="M28 29H132"/>
      <circle class="ac" cx="37" cy="22.5" r="2"/><circle class="ink" cx="45" cy="22.5" r="2"/><circle class="ink" cx="53" cy="22.5" r="2"/>
      <rect class="ink line fb" x="40" y="39" width="44" height="4" rx="2"/><rect class="ac line l2 fb" x="40" y="49" width="62" height="4" rx="2"/><rect class="ink line l3 fb" x="40" y="59" width="30" height="4" rx="2"/></svg>`,
    nodes: `<svg viewBox="0 0 160 90"><path class="acs draw" pathLength="1" d="M34 62 H64 L80 32 L100 32 L126 58"/>
      ${[[34, 62], [80, 32], [126, 58]].map(([x, y], i) => `<circle class="ac node fb" style="--i:${i}" cx="${x}" cy="${y}" r="7"/>`).join('')}</svg>`,
    fans: `<svg viewBox="0 0 160 90">${[0, 1, 2, 3, 4].map(i => `<g class="hop" style="--i:${i}">
      <circle class="ink" cx="${30 + i * 25}" cy="38" r="6.5"/><rect class="${i % 2 ? 'ink' : 'ac'}" x="${22 + i * 25}" y="48" width="16" height="24" rx="6"/></g>`).join('')}</svg>`,
    bars: `<svg viewBox="0 0 160 90">${Array.from({ length: 14 }, (_, i) => `<rect class="${i === 6 ? 'ac' : 'ink'} bar" style="--i:${i}" x="${22 + i * 8.6}" y="22" width="4.6" height="46" rx="2.3"/>`).join('')}</svg>`
  };


  /* ---------- Media block + player ---------- */
  const mediaInner = item => `<div class="art">${ART[item.art] || ART.bars}</div>` +
    (item.poster ? `<img class="poster" alt="" loading="lazy" src="${esc(item.poster)}" onload="this.parentNode.classList.add('has-poster')">` : '') +
    (item.src ? '<video muted loop playsinline preload="none" aria-hidden="true"></video>' : '');

  const players = new Map();
  function makePlayer(media, item) {
    const v = $('video', media);
    let started = false, ok = false;
    const load = () => {
      if (started || !v) return;
      started = true;
      v.addEventListener('loadeddata', () => { ok = true; media.classList.add('has-video'); if (media.classList.contains('is-playing')) v.play().catch(() => {}); }, { once: true });
      v.src = item.src; v.preload = 'metadata'; v.load();
    };
    const p = {
      load,
      play() { load(); media.classList.add('is-playing'); if (ok) v.play().catch(() => {}); },
      pause() { media.classList.remove('is-playing'); if (v) v.pause(); }
    };
    players.set(media, p);
    return p;
  }
  const pauseAll = () => players.forEach(p => p.pause());
  const loadIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { players.get(e.target)?.load(); loadIO.unobserve(e.target); } }), { rootMargin: '400px' });
  const catLine = it => (it.cats || []).join(' / ');

  /* ---------- Static text ---------- */
  $('#about-title').textContent = S.about.title;
  $('#about-text').innerHTML = S.about.text.map(t => `<p>${esc(t)}</p>`).join('');
  $('#about-lists').innerHTML = S.about.lists.map(l => `<div><dt>${esc(l.h)}</dt>${l.items.map(i => `<dd>${esc(i)}</dd>`).join('')}</div>`).join('');
  const mail = $('#mail'); mail.textContent = S.email; mail.href = 'mailto:' + S.email;
  $('#socials').innerHTML = S.socials.filter(s => s.url).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`).join('');
  $('#copy').textContent = `${new Date().getFullYear()} — MS.`;
  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    location.href = `mailto:${S.email}?subject=${encodeURIComponent('Hello from ' + f.get('name'))}&body=${encodeURIComponent(f.get('msg') + '\n\n— ' + f.get('name') + ' (' + f.get('email') + ')')}`;
  });

  /* ---------- Grid ---------- */
  const grid = $('#grid');
  const homeReel = $('#home-reel-list');
  const portfolioDots = $('#portfolio-dots');
  const homeDots = $('#home-dots');
  const revealIO = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('revealed'); revealIO.unobserve(entry.target); }
  }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  const ratios = ['.68', '.70', '.68', '.74', '.72', '.68', '.72', '.68'];
  const cards = S.projects.map((item, index) => {
    const el = document.createElement('article');
    el.className = 'card'; el.tabIndex = 0;
    el.setAttribute('role', 'link'); el.setAttribute('aria-label', 'Open ' + item.title);
    el.style.setProperty('--glow', (item.color || '#222') + '99');
    el.innerHTML = `<div class="media">${mediaInner(item)}</div><div class="cap"><h3>${esc(item.title)}</h3><span>${esc(catLine(item))}</span></div>`;
    const media = $('.media', el);
    media.style.setProperty('--tone', item.color || '#222');
    media.style.setProperty('--ratio', item.ratio || ratios[index % ratios.length]);
    const player = makePlayer(media, item);
    loadIO.observe(media);
    revealIO.observe(el);
    if (!reduce) {
      if (canHover) {
        el.addEventListener('mouseenter', player.play); el.addEventListener('mouseleave', player.pause);
        el.addEventListener('focus', player.play); el.addEventListener('blur', player.pause);
      } else {
        new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? player.play() : player.pause()), { threshold: 0.6 }).observe(el);
      }
    }
    const open = () => navigate('#/project/' + item.id);
    el.addEventListener('click', open);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    return { item, el, player };
  });

  // Keep project cards in source order and let CSS Grid form a clean portfolio.
  let filter = 'All';
  const colCount = () => innerWidth > 900 ? 3 : 2;
  let lastCols = 0;
  function layout() {
    const n = colCount();
    const list = cards.filter(c => filter === 'All' || c.item.cats.includes(filter));
    cards.forEach(c => { if (!list.includes(c)) c.player.pause(); });
    grid.replaceChildren();
    list.forEach(c => grid.appendChild(c.el));
    lastCols = n;
    if (portfolioDots) {
      cards.forEach((c, i) => { const dot = portfolioDots.children[i]; if (dot) dot.hidden = !list.includes(c); });
      if (!list.includes(cards[activePortfolioIndex])) setPortfolioActive(cards.indexOf(list[0]));
    }
  }
  addEventListener('resize', () => { if (colCount() !== lastCols) layout(); });

  const cats = [...new Set(S.projects.flatMap(p => p.cats || []))];
  const filtersEl = $('#filters');
  const filterToggle = $('#filter-toggle');
  filtersEl.innerHTML = ['All', ...cats].map(c => `<button role="tab" data-c="${esc(c)}" aria-selected="${c === 'All'}">${esc(c)}</button>`).join('');
  filterToggle.addEventListener('click', () => {
    const open = filterToggle.getAttribute('aria-expanded') !== 'true';
    filterToggle.setAttribute('aria-expanded', String(open));
    filtersEl.hidden = !open;
  });
  filtersEl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    filter = b.dataset.c;
    $$('button', filtersEl).forEach(x => x.setAttribute('aria-selected', x === b));
    layout();
  });
  $('#scroll-top').addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  let activePortfolioIndex = 0;
  function setPortfolioActive(index) {
    if (index < 0) return;
    activePortfolioIndex = index;
    [...portfolioDots.children].forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
  }
  portfolioDots.innerHTML = cards.map(({ item }, i) => `<button type="button" aria-label="Go to ${esc(item.title)}" aria-current="${i === 0}" data-index="${i}"></button>`).join('');
  portfolioDots.addEventListener('click', e => {
    const dot = e.target.closest('button'); if (!dot) return;
    const card = cards[Number(dot.dataset.index)];
    card?.el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  });
  const portfolioProgressIO = new IntersectionObserver(entries => {
    const current = entries.filter(e => e.isIntersecting).sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];
    if (current) setPortfolioActive(cards.findIndex(c => c.el === current.target));
  }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
  cards.forEach(c => portfolioProgressIO.observe(c.el));

  /* ---------- Selected projects on the home page ---------- */
  const reelItems = S.projects.slice(1, 5);
  homeReel.innerHTML = reelItems.map((item, i) => `<a class="home-reel-card" data-home-index="${i + 1}" href="#/project/${esc(item.id)}" style="--tone:${esc(item.color || '#222')}">
    <div class="home-reel-media">${mediaInner(item)}</div>
    <div class="home-reel-copy"><h2>${esc(item.title)}</h2><p>${esc(catLine(item))}</p></div>
  </a>`).join('');
  const homeVideoIO = new IntersectionObserver(entries => entries.forEach(e => {
    const video = $('video', e.target);
    if (!video) return;
    if (e.isIntersecting) {
      if (!video.src) video.src = video.dataset.src;
      video.play().catch(() => {});
    } else video.pause();
  }), { rootMargin: '160px' });
  $$('.home-reel-card', homeReel).forEach((a, i) => {
    a.addEventListener('click', e => { e.preventDefault(); navigate(a.getAttribute('href')); });
    const video = $('video', a);
    if (video) {
      const media = $('.home-reel-media', a);
      video.addEventListener('loadeddata', () => media.classList.add('has-video'), { once: true });
      video.addEventListener('error', () => video.remove(), { once: true });
      video.dataset.src = reelItems[i].src;
      homeVideoIO.observe(a);
    }
  });
  $('.see-more').addEventListener('click', e => { e.preventDefault(); navigate('#/portfolio'); });
  $('.project-back').addEventListener('click', e => { e.preventDefault(); navigate('#/portfolio'); });
  $('#p-next').addEventListener('click', e => { e.preventDefault(); navigate(e.currentTarget.getAttribute('href')); });

  /* ---------- Featured home sequence ---------- */
  const featuredItems = S.projects.slice(0, 5);
  function showFeatured(index) {
    if (!featuredItems.length) return;
    featureIndex = Math.max(0, Math.min(featuredItems.length - 1, index));
    const item = featuredItems[0], rev = ++featureRevision;
    featuredStage.classList.add('switching');
    setTimeout(() => {
      if (rev !== featureRevision) return;
      featuredStage.dataset.project = item.id;
      featuredStage.style.setProperty('--tone', item.color || '#262626');
      featuredStage.style.background = item.color || '#262626';
      featuredStage.innerHTML = '<div class="art">' + (ART[item.art] || ART.bars) + '</div>' +
        (item.poster ? '<img class="slide-image" alt="" src="' + esc(item.poster) + '">' : '') +
        (item.src ? '<video muted autoplay loop playsinline preload="metadata" aria-hidden="true"></video>' : '');
      const video = $('video', featuredStage);
      if (video) {
        video.addEventListener('loadeddata', () => featuredStage.classList.add('has-video'), { once: true });
        video.addEventListener('error', () => { featuredStage.classList.remove('has-video'); video.remove(); }, { once: true });
        video.src = item.src;
        video.play().catch(() => {});
      }
      $('#featured-title').textContent = item.title;
      $('#featured-category').textContent = catLine(item);
      $('#slide-current').textContent = pad(1);
      $('#slide-total').textContent = pad(featuredItems.length);
      featuredStage.setAttribute('aria-label', 'Open ' + item.title);
      featuredStage.classList.remove('switching');
    }, reduce ? 0 : 220);
  }
  const homePanels = [featured, ...$$('.home-reel-card', homeReel), $('.home-endcard')].filter(Boolean);
  homeDots.innerHTML = homePanels.map((_, i) => `<button type="button" aria-label="Go to featured section ${i + 1}" aria-current="${i === 0}"></button>`).join('');
  function goHome(index) {
    const next = Math.max(0, Math.min(homePanels.length - 1, index));
    homePanels[next]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  homeDots.addEventListener('click', e => {
    const dot = e.target.closest('button'); if (dot) goHome([...homeDots.children].indexOf(dot));
  });
  $('#slide-prev').addEventListener('click', () => goHome(featureIndex - 1));
  $('#slide-next').addEventListener('click', () => goHome(featureIndex + 1));
  featuredStage.addEventListener('click', () => navigate('#/project/' + featuredStage.dataset.project));
  featuredStage.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('#/project/' + featuredStage.dataset.project); } });
  const homeProgressIO = new IntersectionObserver(entries => {
    const current = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!current) return;
    featureIndex = homePanels.indexOf(current.target);
    [...homeDots.children].forEach((dot, i) => dot.setAttribute('aria-current', String(i === featureIndex)));
  }, { threshold: [0.35, 0.55, 0.75] });
  homePanels.forEach(panel => homeProgressIO.observe(panel));
  showFeatured(0);

  /* ---------- Project page ---------- */
  function fillProject(id) {
    const item = S.projects.find(p => p.id === id) || S.projects[0];
    const stage = $('#p-stage');
    stage.className = 'p-stage media is-playing';
    stage.style.setProperty('--tone', item.color || '#222');
    if (item.embed) {
      const sep = item.embed.includes('?') ? '&' : '?';
      stage.innerHTML = `<div class="art">${ART[item.art] || ART.bars}</div><iframe src="${esc(item.embed + sep + 'autoplay=1')}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${esc(item.title)}"></iframe>`;
    } else if (item.src) {
      stage.innerHTML = `<div class="art">${ART[item.art] || ART.bars}</div><video controls autoplay loop playsinline ${item.poster ? `poster="${esc(item.poster)}"` : ''}></video>`;
      const v = $('video', stage);
      v.addEventListener('error', () => { v.remove(); });
      v.src = item.src; v.play().catch(() => {});
    } else stage.innerHTML = `<div class="art">${ART[item.art] || ART.bars}</div>`;
    $('#project-kicker').textContent = 'MEICO STUDIO  /  ' + pad(S.projects.indexOf(item) + 1) + ' — ' + pad(S.projects.length);
    $('#project-hero-title').textContent = item.title;
    $('#project-hero-cat').textContent = catLine(item);
    $('#project-highlight').style.setProperty('--tone', item.color || '#232323');
    $('#highlight-label').textContent = catLine(item);
    $('#highlight-title').textContent = item.title;
    $('#highlight-copy').textContent = item.sub || 'A considered piece of work from Meico Studio.';
    $('#p-cats').textContent = catLine(item);
    $('#p-title').textContent = item.title;
    $('#p-sub').textContent = item.sub || '';
    $('#p-tools').textContent = item.tools || '';
    const i = S.projects.indexOf(item), next = S.projects[(i + 1) % S.projects.length];
    const a = $('#p-next'); a.href = '#/project/' + next.id; $('span', a).textContent = next.title;
    document.title = `${item.title} — Meico Studio`;
  }

  /* ---------- Router ---------- */
  const navLinks = $$('.main-nav a');
  const TITLE = 'MEICO® — Independent Creative Studio';
  function route() {
    const isPortfolioAnchor = location.hash === '#work-grid';
    const [a, b] = (location.hash.startsWith('#/') ? location.hash.slice(2) : '').split('/');
    const view = a === 'about' ? 'about' : a === 'contact' ? 'contact' : (a === 'project' && b) ? 'project' : a === 'home' ? 'home' : 'portfolio';
    pauseAll();
    $$('.view').forEach(v => { v.hidden = v.dataset.view !== view; });
    document.body.dataset.view = view;
    navLinks.forEach(l => l.classList.toggle('on', l.dataset.r === view));
    featured.hidden = view !== 'home';
    const featuredVideo = $('video', featuredStage);
    if (view === 'home' && featuredVideo) featuredVideo.play().catch(() => {});
    else if (featuredVideo) featuredVideo.pause();
    topLabel.textContent = view === 'portfolio' ? '' : view === 'home' ? 'Featured Projects' : view === 'about' ? 'About Meico Studio' : view === 'contact' ? 'Start a Conversation' : 'Selected Project';
    if (view !== 'portfolio') {
      filtersEl.hidden = true;
      filterToggle.setAttribute('aria-expanded', 'false');
    }
    document.title = TITLE;
    if (view === 'project') fillProject(b);
    if (isPortfolioAnchor) requestAnimationFrame(() => $('#work-grid').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));
    else scrollTo(0, 0);
  }
  addEventListener('hashchange', route);

  layout();
  route();
})();
