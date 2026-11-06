/* Carmen Moreno · interacciones de la web */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  // El correo y el WhatsApp se definen en build.mjs (SITE) y llegan en <body data-…>
  const EMAIL = document.body.dataset.email || 'sopranosun@gmail.com';
  const WA = document.body.dataset.wa || '';
  const LANG = (document.documentElement.lang || 'es').slice(0, 2);

  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* sin almacenamiento */ } },
  };

  /* ---------- Textos por idioma ---------- */
  const I18N = {
    es: {
      copied: 'Mensaje copiado', copyFail: 'No se pudo copiar: selecciona el texto manualmente', emailCopied: 'Correo copiado',
      opening: 'Abriendo tu correo con el mensaje preparado…', openingWa: 'Abriendo WhatsApp con el mensaje preparado…',
      agendaMore: n => `Ver todo el archivo (${n})`, menuOpen: 'Abrir menú', menuClose: 'Cerrar menú', videoDefault: 'Vídeo de Carmen Moreno',
      q: (n, t) => `Pregunta ${n} de ${t}`, back: '← Volver a la pregunta anterior', start: 'Tu punto de partida',
      format: m => `Formato recomendado: <strong>clases individuales ${m}</strong>.`,
      modes: { bcn: 'en Barcelona', online: 'online, desde donde estés', any: 'online o en Barcelona' },
      modern: ' Como trabajas música moderna, Carmen adapta la exigencia de comisuras y apoyo al estilo, sin cambiar la base técnica.',
      request: 'Solicitar esta clase', see: 'Ver el programa', again: 'Repetir el test',
      mail: d => `Hola, Carmen:\n\nMe gustaría solicitar una clase de técnica vocal.\n\n` +
        `Programa: ${d.programa || 'Aún no lo sé, me gustaría tu consejo'}\nModalidad: ${d.modalidad || 'Online'}\nFormato: ${d.formato || 'Clase suelta'}\n` +
        `Días preferidos: ${d.dias || 'a convenir'}\nFranja: ${d.franja || 'Indiferente'}\nPaís / zona horaria: ${d.pais || '—'}\n\nSobre mí: ${d.mensaje || '—'}\n\n${d.firma}`,
      subject: p => `Solicitud de clase · ${p || 'Técnica vocal'}`,
    },
    en: {
      copied: 'Message copied', copyFail: 'Could not copy: please select the text manually', emailCopied: 'Email address copied',
      opening: 'Opening your email with the message ready…', openingWa: 'Opening WhatsApp with the message ready…',
      agendaMore: n => `See the full archive (${n})`, menuOpen: 'Open menu', menuClose: 'Close menu', videoDefault: 'Video by Carmen Moreno',
      q: (n, t) => `Question ${n} of ${t}`, back: '← Back to the previous question', start: 'Your starting point',
      format: m => `Recommended format: <strong>one-to-one lessons ${m}</strong>.`,
      modes: { bcn: 'in Barcelona', online: 'online, wherever you are', any: 'online or in Barcelona' },
      modern: ' As you sing contemporary music, Carmen adapts the work on lip corners and support to the style, without changing the technical foundation.',
      request: 'Request this lesson', see: 'See the programme', again: 'Take the test again',
      mail: d => `Hello Carmen,\n\nI would like to book a vocal technique lesson.\n\n` +
        `Programme: ${d.programa || 'I’m not sure yet, I’d like your advice'}\nMode: ${d.modalidad || 'Online'}\nFormat: ${d.formato || 'Single lesson'}\n` +
        `Preferred days: ${d.dias || 'to be agreed'}\nTime of day: ${d.franja || 'Any'}\nCountry / time zone: ${d.pais || '—'}\n\nAbout me: ${d.mensaje || '—'}\n\n${d.firma}`,
      subject: p => `Lesson request · ${p || 'Vocal technique'}`,
    },
    ca: {
      copied: 'Missatge copiat', copyFail: 'No s’ha pogut copiar: selecciona el text manualment', emailCopied: 'Correu copiat',
      opening: 'S’obre el teu correu amb el missatge preparat…', openingWa: 'S’obre WhatsApp amb el missatge preparat…',
      agendaMore: n => `Mostra tot l’arxiu (${n})`, menuOpen: 'Obre el menú', menuClose: 'Tanca el menú', videoDefault: 'Vídeo de Carmen Moreno',
      q: (n, t) => `Pregunta ${n} de ${t}`, back: '← Torna a la pregunta anterior', start: 'El teu punt de partida',
      format: m => `Format recomanat: <strong>classes individuals ${m}</strong>.`,
      modes: { bcn: 'a Barcelona', online: 'en línia, siguis on siguis', any: 'en línia o a Barcelona' },
      modern: ' Com que treballes música moderna, la Carmen adapta l’exigència de comissures i suport a l’estil, sense canviar la base tècnica.',
      request: 'Sol·licita aquesta classe', see: 'Mira el programa', again: 'Repeteix el test',
      mail: d => `Hola, Carmen:\n\nM’agradaria sol·licitar una classe de tècnica vocal.\n\n` +
        `Programa: ${d.programa || 'Encara no ho sé, m’agradaria el teu consell'}\nModalitat: ${d.modalidad || 'En línia'}\nFormat: ${d.formato || 'Classe solta'}\n` +
        `Dies preferits: ${d.dias || 'a convenir'}\nFranja: ${d.franja || 'Indiferent'}\nPaís / zona horària: ${d.pais || '—'}\n\nSobre mi: ${d.mensaje || '—'}\n\n${d.firma}`,
      subject: p => `Sol·licitud de classe · ${p || 'Tècnica vocal'}`,
    },
  };
  const L = I18N[LANG] || I18N.es;
  const waLink = text => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;

  function toast(msg) {
    const t = $('.toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('is-on'), 3200);
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast(L.copied); }
    catch { toast(L.copyFail); }
  }

  /* ---------- Cabecera y progreso ---------- */
  function initHeader() {
    const header = $('.site-header');
    const bar = $('.progress span');
    let last = scrollY;
    let ticking = false;
    const update = () => {
      const y = scrollY;
      header.classList.toggle('is-solid', y > 40);
      const goingDown = y > last && y > 420;
      if (!document.body.classList.contains('menu-open')) header.classList.toggle('is-hidden', goingDown);
      last = y;
      // Barra inferior (móvil) y WhatsApp (escritorio): aparecen al pasar la cabecera
      // y se apartan al llegar al pie, donde ya están los mismos contactos
      const nearEnd = y + innerHeight > document.documentElement.scrollHeight - 260;
      document.body.classList.toggle('show-bar', y > innerHeight * .55 && !nearEnd);
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  }

  function initMenu() {
    const burger = $('.burger');
    const menu = $('#menu-movil');
    if (!burger || !menu) return;
    const set = open => {
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? L.menuClose : L.menuOpen);
      document.body.classList.toggle('menu-open', open);
      menu.hidden = !open;
      if (open) $('a', menu)?.focus({ preventScroll: true });
    };
    burger.addEventListener('click', () => set(burger.getAttribute('aria-expanded') !== 'true'));
    addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { set(false); burger.focus(); } });
    $$('a', menu).forEach(a => a.addEventListener('click', () => set(false)));
  }

  /* ---------- Revelado, contadores y parallax ---------- */
  function initReveal() {
    const els = $$('.reveal, .clip');
    if (!('IntersectionObserver' in window) || reduced) { els.forEach(e => e.classList.add('is-in')); return; }
    // Un elemento .clip empieza recortado del todo (clip-path) y el navegador lo considera
    // invisible: ni lo detecta al hacer scroll ni descarga su foto. Por eso se vigila su
    // contenedor y, al aparecer este, se abren también los .clip que tenga dentro.
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      $$('.clip', en.target).forEach(c => c.classList.add('is-in'));
      io.unobserve(en.target);
    }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    const targets = new Set(els.map(e => e.classList.contains('clip') ? e.parentElement : e));
    targets.forEach(e => io.observe(e));
  }

  function initCounters() {
    const els = $$('[data-count]');
    if (!els.length) return;
    const run = el => {
      const end = +el.dataset.count;
      if (reduced) { el.textContent = end; return; }
      const t0 = performance.now();
      const dur = 1800;
      const tick = t => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    }), { threshold: .6 });
    els.forEach(e => io.observe(e));
  }

  function initParallax() {
    const els = $$('[data-parallax]');
    if (!els.length || reduced) return;
    let ticking = false;
    const update = () => {
      els.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const k = parseFloat(el.dataset.parallax) || .15;
        el.style.transform = `translate3d(0, ${(r.top + r.height / 2 - innerHeight / 2) * -k}px, 0)`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  }

  function initFlow() {
    $$('.flow').forEach(f => {
      f.style.setProperty('--p', 0);
      new IntersectionObserver((en, io) => { if (en[0].isIntersecting) { f.style.setProperty('--p', 1); io.disconnect(); } }, { threshold: .4 }).observe(f);
    });
  }

  /* ---------- Intro con telón ---------- */
  function initIntro() {
    const intro = $('.intro');
    if (!intro) return;
    if (store.get('cm-intro') || reduced) { intro.remove(); return; }
    intro.hidden = false;
    document.body.style.overflow = 'hidden';
    const close = animate => {
      store.set('cm-intro', '1');
      document.body.style.overflow = '';
      if (!animate) { intro.remove(); return; }
      intro.classList.add('is-opening');
      setTimeout(() => intro.remove(), 1700);
    };
    $('[data-intro-enter]', intro)?.addEventListener('click', () => close(true));
    $('[data-intro-skip]', intro)?.addEventListener('click', () => close(false));
    $('[data-intro-enter]', intro)?.focus({ preventScroll: true });
  }

  /* ---------- Hero con pase de imágenes ---------- */
  function initHero() {
    const hero = $('.hero');
    if (!hero) return;
    const slides = $$('.hero__slide', hero);
    const rail = $$('.hero__rail button', hero);
    const now = $('[data-now-label]', hero);
    if (slides.length < 2) return;
    let i = 0;
    let timer;
    const DUR = 7000;
    const show = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      rail.forEach((b, k) => {
        b.classList.toggle('is-active', k === i);
        b.setAttribute('aria-pressed', k === i);
        const bar = $('i', b);
        if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      });
      if (now) now.textContent = slides[i].dataset.now || '';
      // precarga de la siguiente imagen
      const next = $('img', slides[(i + 1) % slides.length]);
      if (next && next.loading === 'lazy') next.loading = 'eager';
    };
    const play = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => show(i + 1), DUR); };
    rail.forEach((b, k) => { b.style.setProperty('--dur', DUR + 'ms'); b.addEventListener('click', () => { show(k); play(); }); });
    document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : play());
    show(0); play();
  }

  /* ---------- Test de punto de partida ---------- */
  // Los títulos de RESULTS deben coincidir con los valores de «programa» del formulario de reserva de cada idioma
  const QUIZ_EN = [
    { q: 'What is your relationship with singing right now?', o: [
      ['I want to start and have no vocal training', { ini: 3 }],
      ['I sing in a choir', { cor: 3 }],
      ['I study singing or perform as a soloist', { pro: 3 }],
      ['I use my voice for work (teaching, broadcasting…)', { voz: 3 }],
    ] },
    { q: 'What would you like to solve first?', o: [
      ['Breathing properly and not running out of air', { ini: 2, voz: 1 }],
      ['Staying in tune and holding my line in the choir', { cor: 2 }],
      ['High notes, leaps or a specific passage', { pro: 2 }],
      ['Ending the day without fatigue or hoarseness', { voz: 3 }],
    ] },
    { q: 'What repertoire do you work on?', o: [
      ['None yet: I want to learn the basics', { ini: 2 }],
      ['Choral works we rehearse in the group', { cor: 2 }],
      ['Opera, oratorio, lied or art song', { pro: 2 }],
      ['Pop or contemporary music', { pro: 1, ini: 1, mod: 2 }],
    ] },
    { q: 'How would you like to take your lessons?', o: [
      ['Online, from home', { online: 1 }],
      ['In person in Barcelona', { bcn: 1 }],
      ['I don’t mind, whatever works', {}],
      ['I’d like to talk to Carmen first', { talk: 1 }],
    ] },
  ];
  const RESULTS_EN = {
    ini: { t: 'Introduction to vocal technique', d: 'You will start with the essentials: abdominal breathing, jaw protrusion, lip work and placing the sound on the vomer. These are the foundations you will later apply to any piece.', href: 'clases.html#iniciacion' },
    cor: { t: 'Vocal technique for choristers', d: 'You will work on a soloist’s technique applied to the pieces your choir rehearses, so you can sing your line with confidence, good tuning and enjoyment.', href: 'clases.html#coralistas' },
    pro: { t: 'Coaching for professional singers', d: 'Carmen pinpoints the technical detail behind the result you don’t want, chooses exercises with those same intervals and applies them to the passage in the piece.', href: 'clases.html#profesionales' },
    voz: { t: 'The voice as a working tool', d: 'Abdominal breathing, protrusion and sound placement so that teachers, broadcasters and other voice professionals look after their vocal apparatus all day long.', href: 'clases.html#voz-profesional' },
  };
  const QUIZ_CA = [
    { q: 'Quina és la teva relació amb el cant ara mateix?', o: [
      ['Vull començar i no tinc formació vocal', { ini: 3 }],
      ['Canto en una coral', { cor: 3 }],
      ['Estudio cant o actuo com a solista', { pro: 3 }],
      ['Faig servir la veu a la feina (docència, locució…)', { voz: 3 }],
    ] },
    { q: 'Què t’agradaria resoldre primer?', o: [
      ['Respirar bé i que no em falti l’aire', { ini: 2, voz: 1 }],
      ['Afinar i sostenir la meva línia dins la coral', { cor: 2 }],
      ['Els aguts, els salts o un passatge concret', { pro: 2 }],
      ['Acabar el dia sense cansament ni ronquera', { voz: 3 }],
    ] },
    { q: 'Amb quin repertori treballes?', o: [
      ['Encara cap: vull aprendre les bases', { ini: 2 }],
      ['Obres corals que assagem amb el grup', { cor: 2 }],
      ['Òpera, oratori, lied o cançó lírica', { pro: 2 }],
      ['Música moderna o melòdica', { pro: 1, ini: 1, mod: 2 }],
    ] },
    { q: 'Com t’agradaria rebre les classes?', o: [
      ['En línia, des de casa', { online: 1 }],
      ['Presencial a Barcelona', { bcn: 1 }],
      ['M’és igual, el que funcioni', {}],
      ['Primer vull parlar amb la Carmen', { talk: 1 }],
    ] },
  ];
  const RESULTS_CA = {
    ini: { t: 'Iniciació a la tècnica vocal', d: 'Començaràs pel més fonamental: respiració abdominal, protrusió de la mandíbula, treball de llavis i la col·locació del so al vòmer. Són les bases que després aplicaràs a qualsevol obra.', href: 'clases.html#iniciacion' },
    cor: { t: 'Tècnica vocal per a coralistes', d: 'Treballaràs la tècnica d’un solista aplicada a les obres que assaja la teva coral, per cantar la teva línia amb seguretat, afinació i gaudi.', href: 'clases.html#coralistas' },
    pro: { t: 'Assistència per a professionals del cant', d: 'La Carmen identifica quin detall tècnic produeix el resultat que no vols, tria els exercicis amb aquests mateixos intervals i els aplica al passatge de l’obra.', href: 'clases.html#profesionales' },
    voz: { t: 'La veu com a eina de treball', d: 'Respiració abdominal, protrusió i col·locació del so perquè docents, locutors i altres professionals de la veu cuidin el seu aparell fonador durant tota la jornada.', href: 'clases.html#voz-profesional' },
  };
  const QUIZ_ES = [
    { q: '¿Cuál es tu relación con el canto ahora mismo?', o: [
      ['Quiero empezar y no tengo formación vocal', { ini: 3 }],
      ['Canto en un coro', { cor: 3 }],
      ['Estudio canto o actúo como solista', { pro: 3 }],
      ['Uso la voz en mi trabajo (docencia, locución…)', { voz: 3 }],
    ] },
    { q: '¿Qué te gustaría resolver primero?', o: [
      ['Respirar bien y que no me falte el aire', { ini: 2, voz: 1 }],
      ['Afinar y sostener mi línea dentro del coro', { cor: 2 }],
      ['Los agudos, los saltos o un pasaje concreto', { pro: 2 }],
      ['Terminar el día sin cansancio ni ronquera', { voz: 3 }],
    ] },
    { q: '¿Con qué repertorio trabajas?', o: [
      ['Todavía ninguno: quiero aprender las bases', { ini: 2 }],
      ['Obras corales que ensayamos en el grupo', { cor: 2 }],
      ['Ópera, oratorio, lied o canción lírica', { pro: 2 }],
      ['Música moderna o melódica', { pro: 1, ini: 1, mod: 2 }],
    ] },
    { q: '¿Cómo te gustaría recibir las clases?', o: [
      ['Online, desde casa', { online: 1 }],
      ['Presencial en Barcelona', { bcn: 1 }],
      ['Me da igual, lo que funcione', {}],
      ['Primero quiero hablar con Carmen', { talk: 1 }],
    ] },
  ];
  const RESULTS_ES = {
    ini: { t: 'Iniciación en técnica vocal', d: 'Empezarás por lo fundamental: respiración abdominal, protrusión de la mandíbula, trabajo de labios y la colocación del sonido en vómer. Son las bases que después aplicarás a cualquier obra.', href: 'clases.html#iniciacion' },
    cor: { t: 'Técnica vocal para coralistas', d: 'Trabajarás la técnica de un solista aplicada a las obras que ensaya tu coro, para cantar tu línea con seguridad, afinación y disfrute.', href: 'clases.html#coralistas' },
    pro: { t: 'Asistencia para profesionales del canto', d: 'Carmen identifica qué detalle técnico produce el resultado que no quieres, elige los ejercicios con esos mismos intervalos y los aplica al pasaje de la obra.', href: 'clases.html#profesionales' },
    voz: { t: 'La voz como herramienta de trabajo', d: 'Respiración abdominal, protrusión y colocación del sonido para que docentes, locutores y otros profesionales de la voz cuiden su aparato fonador durante toda la jornada.', href: 'clases.html#voz-profesional' },
  };
  const QUIZ = { es: QUIZ_ES, en: QUIZ_EN, ca: QUIZ_CA }[LANG] || QUIZ_ES;
  const RESULTS = { es: RESULTS_ES, en: RESULTS_EN, ca: RESULTS_CA }[LANG] || RESULTS_ES;
  function initQuiz() {
    const box = $('.quiz');
    if (!box) return;
    const body = $('.quiz__body', box);
    const bar = $('.quiz__bar span', box);
    let step = 0;
    let score = {};
    const picks = [];
    const render = () => {
      bar.style.width = (step / QUIZ.length * 100) + '%';
      if (step >= QUIZ.length) return result();
      const it = QUIZ[step];
      body.innerHTML = `<div class="quiz__step"><span class="quiz__count">${L.q(step + 1, QUIZ.length)}</span><p class="quiz__q">${it.q}</p><div class="quiz__options">${it.o.map((o, k) => `<button type="button" class="quiz__opt" data-k="${k}">${o[0]}</button>`).join('')}</div>${step ? `<button type="button" class="quiz__back">${L.back}</button>` : ''}</div>`;
      $$('.quiz__opt', body).forEach(b => b.addEventListener('click', () => {
        b.classList.add('is-picked');
        picks[step] = it.o[+b.dataset.k];
        setTimeout(() => { step++; render(); }, reduced ? 0 : 260);
      }));
      $('.quiz__back', body)?.addEventListener('click', () => { step--; render(); });
    };
    const result = () => {
      score = {};
      picks.forEach(p => Object.entries(p[1]).forEach(([k, v]) => { score[k] = (score[k] || 0) + v; }));
      const key = ['ini', 'cor', 'pro', 'voz'].sort((a, b) => (score[b] || 0) - (score[a] || 0))[0];
      const r = RESULTS[key];
      const mode = score.bcn ? L.modes.bcn : score.online ? L.modes.online : L.modes.any;
      const extra = score.mod ? L.modern : '';
      body.innerHTML = `<div class="quiz__step quiz__result"><span class="quiz__count">${L.start}</span><h3>${r.t}</h3><p class="lead">${r.d}${extra}</p><p>${L.format(mode)}</p><div class="btn-row"><a class="btn" href="escuela-online.html?programa=${encodeURIComponent(r.t)}#reserva">${L.request}</a><a class="link-arrow" href="${r.href}">${L.see}</a></div><button type="button" class="quiz__back">${L.again}</button></div>`;
      $('.quiz__back', body).addEventListener('click', () => { step = 0; picks.length = 0; render(); });
      store.set('cm-programa', r.t);
    };
    render();
  }

  /* ---------- Mapa anatómico ---------- */
  function initAnatomy() {
    const root = $('.anatomy');
    if (!root) return;
    const btns = $$('[data-zone]', root).filter(b => b.matches('button'));
    const panels = $$('.anatomy__content', root);
    const zones = $$('.zone', root);
    const select = z => {
      root.dataset.active = z;
      btns.forEach(b => b.setAttribute('aria-pressed', b.dataset.zone === z));
      panels.forEach(p => { p.hidden = p.dataset.for !== z; });
      zones.forEach(s => s.classList.toggle('is-active', s.dataset.for === z));
      // Lámina del gesto: si no tiene, el texto ocupa todo el ancho
      const laminas = $$('.anat-lamina', root);
      laminas.forEach(f => f.classList.toggle('is-active', f.dataset.for === z));
      root.classList.toggle('no-fig', !laminas.some(f => f.dataset.for === z));
      // La animación 3D de la zona elegida se reproduce; las demás se paran
      panels.forEach(p => $$('video', p).forEach(v => {
        if (p.hidden || reduced) { v.pause(); return; }
        if (inView) v.play().catch(() => {});
      }));
    };
    // Solo se reproducen cuando el mapa está en pantalla
    let inView = false;
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; select(root.dataset.active); }, { threshold: .2 }).observe(root);
    btns.forEach(b => b.addEventListener('click', () => select(b.dataset.zone)));
    select(btns[0]?.dataset.zone);
  }

  /* ---------- Podcast ---------- */
  function initPodcast() {
    const box = $('[data-podcast]');
    if (!box) return;
    const audio = $('[data-pod-audio]', box);
    const eps = $$('.pod__ep', box);
    const play = $('[data-pod-play]', box);
    const seek = $('[data-pod-seek]', box);
    const cur = $('[data-pod-cur]', box);
    const dur = $('[data-pod-dur]', box);
    const speedBtn = $('[data-pod-speed]', box);
    const speeds = [1, 1.25, 1.5, .75];
    let speed = 0;
    const fmt = s => isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00';
    const load = (btn, autoplay) => {
      eps.forEach(e => e.setAttribute('aria-current', e === btn));
      $('[data-pod-n]', box).textContent = btn.dataset.n;
      $('[data-pod-title]', box).textContent = $('.pod__t', btn).textContent;
      dur.textContent = $('.pod__d', btn).textContent;
      if (audio.dataset.src !== btn.dataset.src) {
        audio.src = btn.dataset.src; audio.dataset.src = btn.dataset.src;
        seek.value = 0; cur.textContent = '0:00';
      }
      audio.playbackRate = speeds[speed];
      if (autoplay) audio.play().catch(() => {});
    };
    eps.forEach(b => b.addEventListener('click', () => load(b, true)));
    play.addEventListener('click', () => {
      if (!audio.dataset.src) load(eps.find(e => e.getAttribute('aria-current') === 'true') || eps[0], false);
      audio.paused ? audio.play().catch(() => {}) : audio.pause();
    });
    speedBtn.addEventListener('click', () => {
      speed = (speed + 1) % speeds.length;
      audio.playbackRate = speeds[speed];
      speedBtn.textContent = String(speeds[speed]).replace('.', ',') + '×';
    });
    audio.addEventListener('play', () => { box.classList.add('is-playing'); play.setAttribute('aria-label', box.dataset.labelPause); });
    audio.addEventListener('pause', () => { box.classList.remove('is-playing'); play.setAttribute('aria-label', box.dataset.labelPlay); });
    audio.addEventListener('loadedmetadata', () => { dur.textContent = fmt(audio.duration); });
    audio.addEventListener('timeupdate', () => {
      cur.textContent = fmt(audio.currentTime);
      if (audio.duration) seek.value = Math.round(audio.currentTime / audio.duration * 1000);
    });
    seek.addEventListener('input', () => { if (audio.duration) audio.currentTime = seek.value / 1000 * audio.duration; });
    audio.addEventListener('ended', () => {
      const i = eps.findIndex(e => e.getAttribute('aria-current') === 'true');
      if (eps[i + 1]) load(eps[i + 1], true);
    });
    // Enlace directo a un episodio (por ejemplo, desde el mapa del método): academia.html#podcast-3
    const pick = () => {
      const m = location.hash.match(/^#podcast-(\d)$/);
      const btn = m && $('#podcast-' + m[1]);
      if (btn) { load(btn, false); box.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }
    };
    addEventListener('hashchange', pick);
    // Fichas de episodio (página del podcast): «Escuchar» reproduce ese episodio y sube al reproductor
    $$('[data-pod-go]').forEach(btn => btn.addEventListener('click', () => {
      const ep = $('#podcast-' + btn.dataset.podGo);
      if (!ep) return;
      load(ep, true);
      box.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    }));
    eps[0] && load(eps[0], false);
    pick();
  }

  /* ---------- Línea del tiempo ---------- */
  function initTimeline() {
    const tl = $('.timeline');
    if (!tl) return;
    const items = $$('.tl', tl);
    const fill = $('.timeline__fill', tl);
    $$('[data-filter]').forEach(chip => chip.addEventListener('click', () => {
      const f = chip.dataset.filter;
      $$('[data-filter]').forEach(c => c.setAttribute('aria-pressed', c === chip));
      items.forEach(it => { it.hidden = f !== 'todo' && !it.dataset.cat.split(' ').includes(f); });
      update();
    }));
    const io = new IntersectionObserver(en => en.forEach(e => e.target.classList.toggle('is-visible', e.isIntersecting || e.boundingClientRect.top < 0)), { rootMargin: '0px 0px -40% 0px' });
    items.forEach(i => io.observe(i));
    const update = () => {
      const r = tl.getBoundingClientRect();
      const p = Math.min(Math.max((innerHeight * .6 - r.top) / r.height, 0), 1);
      if (fill) fill.style.height = (p * r.height) + 'px';
    };
    addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();
  }

  /* ---------- Modal: vídeo, imagen, Vimeo ---------- */
  const modal = {
    el: null, last: null, list: [], idx: 0,
    open(html, trigger) {
      this.el = this.el || $('#modal');
      if (!this.el) return;
      this.last = trigger || document.activeElement;
      $('.modal__body', this.el).innerHTML = html;
      this.el.hidden = false;
      document.body.style.overflow = 'hidden';
      $('.modal__close', this.el).focus();
    },
    close() {
      if (!this.el || this.el.hidden) return;
      $('.modal__body', this.el).innerHTML = '';
      this.el.hidden = true;
      document.body.style.overflow = '';
      this.list = [];
      this.last?.focus?.();
    },
  };
  function initModal() {
    const el = $('#modal');
    if (!el) return;
    $$('[data-close]', el).forEach(b => b.addEventListener('click', () => modal.close()));
    addEventListener('keydown', e => {
      if (el.hidden) return;
      if (e.key === 'Escape') modal.close();
      if (modal.list.length && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        modal.idx = (modal.idx + (e.key === 'ArrowRight' ? 1 : -1) + modal.list.length) % modal.list.length;
        showImage(modal.list[modal.idx]);
      }
    });
  }
  const escAttr = s => String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;');
  function showImage(btn) {
    $('.modal__body').innerHTML = `<figure style="margin:0"><img src="${escAttr(btn.dataset.full)}" alt="${escAttr(btn.dataset.caption || '')}"><figcaption class="modal__caption">${escAttr(btn.dataset.caption || '')}</figcaption></figure>`;
  }

  function initVideos() {
    $$('[data-video]').forEach(card => {
      const src = card.dataset.video;
      const caption = card.dataset.caption || '';
      card.addEventListener('click', () => {
        modal.open(`<figure style="margin:0"><video src="${escAttr(src)}" controls autoplay playsinline poster="${escAttr(card.dataset.poster || '')}"></video>${caption ? `<figcaption class="modal__caption">${escAttr(caption)}</figcaption>` : ''}</figure>`, card);
      });
      if (finePointer && !reduced && card.classList.contains('vcard')) {
        let v;
        card.addEventListener('mouseenter', () => {
          if (!v) {
            v = document.createElement('video');
            v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
            v.src = src + '#t=1';
            v.setAttribute('aria-hidden', 'true');
            $('img', card)?.after(v);
          }
          v.play().then(() => card.classList.add('is-previewing')).catch(() => {});
        });
        card.addEventListener('mouseleave', () => { card.classList.remove('is-previewing'); v?.pause(); });
      }
    });
    $$('[data-vimeo]').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.vimeo.replace(/\D/g, '');
      modal.open(`<iframe src="https://player.vimeo.com/video/${id}?autoplay=1&dnt=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${escAttr(b.dataset.caption || L.videoDefault)}"></iframe><p class="modal__caption">${escAttr(b.dataset.caption || '')}</p>`, b);
    }));
    $$('.reel').forEach(reel => {
      const track = $('.reel__track', reel);
      $$('[data-dir]', reel.closest('section') || reel).forEach(b => b.addEventListener('click', () => {
        track.scrollBy({ left: (+b.dataset.dir) * track.clientWidth * .8, behavior: reduced ? 'auto' : 'smooth' });
      }));
    });
  }

  function initGallery() {
    $$('.gallery').forEach(g => {
      const items = $$('[data-full]', g);
      items.forEach((b, k) => b.addEventListener('click', () => {
        modal.open('', b);
        modal.list = items; modal.idx = k;
        showImage(b);
      }));
    });
  }

  /* ---------- Constelación de festivales ---------- */
  function initAtlas() {
    const atlas = $('.atlas');
    if (!atlas) return;
    const pins = $$('.atlas__pin', atlas);
    const rows = $$('[data-city]', atlas).filter(e => e.tagName === 'LI');
    const set = c => {
      pins.forEach(p => p.classList.toggle('is-active', p.dataset.city === c));
      rows.forEach(r => r.classList.toggle('is-active', r.dataset.city === c));
    };
    [...pins, ...rows].forEach(el => {
      el.addEventListener('mouseenter', () => set(el.dataset.city));
      el.addEventListener('focus', () => set(el.dataset.city));
      el.addEventListener('click', () => set(el.dataset.city));
    });
  }

  /* ---------- Reserva en pasos ---------- */
  function initWizard() {
    const form = $('#reserva-form');
    if (!form) return;
    const panels = $$('.wizard__panel', form);
    const dots = $$('.wizard__steps span', form);
    const prev = $('[data-prev]', form);
    const next = $('[data-next]', form);
    const send = $('[data-send]', form);
    const copyBtn = $('[data-copy]', form);
    const summary = $('.summary', form);
    let step = 0;

    const params = new URLSearchParams(location.search);
    const wanted = params.get('programa') || store.get('cm-programa');
    if (wanted) {
      const radio = $$('input[name="programa"]', form).find(r => r.value === wanted);
      if (radio) radio.checked = true;
    }

    const waBtn = $('[data-wa-send]', form);
    const message = () => {
      const d = new FormData(form);
      return L.mail({
        programa: d.get('programa'), modalidad: d.get('modalidad'), formato: d.get('formato'),
        dias: d.getAll('dias').join(', '), franja: d.get('franja'), pais: d.get('pais'), mensaje: d.get('mensaje'),
        firma: `${d.get('nombre')}\n${d.get('correo')}${d.get('telefono') ? '\n' + d.get('telefono') : ''}`,
      });
    };
    const show = n => {
      step = n;
      panels.forEach((p, k) => { p.hidden = k !== n; });
      dots.forEach((d, k) => d.classList.toggle('is-done', k <= n));
      prev.hidden = n === 0;
      next.hidden = n === panels.length - 1;
      send.hidden = copyBtn.hidden = n !== panels.length - 1;
      if (waBtn) waBtn.hidden = !WA || n !== panels.length - 1;
      if (n === panels.length - 1) summary.textContent = message();
      const first = $('input, select, textarea', panels[n]);
      if (n && first) first.focus({ preventScroll: true });
    };
    const valid = () => {
      const fields = $$('input, select, textarea', panels[step]);
      for (const f of fields) { if (!f.checkValidity()) { f.reportValidity(); return false; } }
      return true;
    };
    next.addEventListener('click', () => { if (valid()) show(step + 1); });
    prev.addEventListener('click', () => show(step - 1));
    copyBtn.addEventListener('click', () => copy(message()));
    waBtn?.addEventListener('click', () => {
      if (!form.reportValidity()) return;
      window.open(waLink(message()), '_blank', 'noopener');
      toast(L.openingWa);
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(form);
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(L.subject(d.get('programa')))}&body=${encodeURIComponent(message())}`;
      toast(L.opening);
    });
    show(0);
  }

  function initContact() {
    const form = $('#contacto-form');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(form);
      const body = `${d.get('mensaje')}\n\n${d.get('nombre')}\n${d.get('correo')}`;
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(d.get('motivo') + ' · ' + d.get('nombre'))}&body=${encodeURIComponent(body)}`;
      toast(L.opening);
    });
    $('[data-wa-contact]', form)?.addEventListener('click', () => {
      if (!form.reportValidity()) return;
      const d = new FormData(form);
      window.open(waLink(`${d.get('motivo')}\n\n${d.get('mensaje')}\n\n${d.get('nombre')}\n${d.get('correo')}`), '_blank', 'noopener');
      toast(L.openingWa);
    });
    $$('[data-copy-email]').forEach(b => b.addEventListener('click', () => copy(EMAIL).then(() => toast(L.emailCopied))));
  }

  /* ---------- Academia: buscador y filtros ---------- */
  function initLibrary() {
    const lib = $('[data-library]');
    if (!lib) return;
    const cards = $$('.article-card', lib);
    const input = $('[data-library-search]');
    const chips = $$('[data-library-filter]');
    const empty = $('.library__empty', lib);
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    // Se busca en la tarjeta y en el texto completo del artículo al que lleva
    const texts = cards.map(c => norm(c.textContent + ' ' + ($(c.getAttribute('href'))?.textContent || '')));
    let cat = 'todo';
    const apply = () => {
      const words = norm(input?.value || '').split(/\s+/).filter(Boolean);
      let shown = 0;
      cards.forEach((c, i) => {
        const ok = (cat === 'todo' || c.dataset.cat.split(' ').includes(cat)) && words.every(w => texts[i].includes(w));
        c.hidden = !ok;
        if (ok) { shown++; c.classList.add('is-in'); }
      });
      if (empty) empty.hidden = shown > 0;
    };
    chips.forEach(chip => chip.addEventListener('click', () => {
      cat = chip.dataset.libraryFilter;
      chips.forEach(c => c.setAttribute('aria-pressed', c === chip));
      apply();
    }));
    input?.addEventListener('input', apply);
  }

  /* ---------- Agenda: filtro por tipo ---------- */
  function initAgenda() {
    const chips = $$('[data-gig-filter]');
    if (!chips.length) return;
    const gigs = $$('.gigs--archivo .gig');
    // En móvil el archivo empieza en versión corta, con un botón para ver el resto
    const VISIBLE = 6;
    let more;
    const expand = () => { gigs.forEach(g => g.classList.remove('is-extra')); more?.remove(); };
    if (matchMedia('(max-width: 860px)').matches && gigs.length > VISIBLE + 2) {
      gigs.slice(VISIBLE).forEach(g => g.classList.add('is-extra'));
      more = document.createElement('button');
      more.type = 'button';
      more.className = 'btn btn--ghost gigs__more';
      more.textContent = L.agendaMore(gigs.length);
      more.addEventListener('click', expand);
      $('.gigs--archivo').append(more);
    }
    chips.forEach(chip => chip.addEventListener('click', () => {
      const f = chip.dataset.gigFilter;
      expand();
      chips.forEach(c => c.setAttribute('aria-pressed', c === chip));
      gigs.forEach(g => { g.hidden = f !== 'todo' && g.dataset.tipo !== f; });
    }));
  }

  /* ---------- Partitura del aula ---------- */
  function initStudio() {
    const notes = $$('.studio__score .note');
    if (!notes.length || reduced) return;
    let k = 0;
    setInterval(() => { notes.forEach((n, i) => n.classList.toggle('is-on', i === k)); k = (k + 1) % notes.length; }, 520);
  }

  /* ---------- Aula: el alumno escribe el código de Meet y se abre en otra ventana ---------- */
  function meetCode(value) {
    let v = (value || '').trim().toLowerCase();
    const m = v.match(/meet\.google\.com\/([a-z-]+)/);
    if (m) v = m[1];
    v = v.replace(/[^a-z]/g, '');
    return /^[a-z]{10}$/.test(v) ? `${v.slice(0, 3)}-${v.slice(3, 7)}-${v.slice(7)}` : null;
  }
  function initAula() {
    const form = $('#aula-form');
    if (!form) return;
    const input = $('#aula-codigo', form);
    const estado = $('.aula__estado', form);
    const D = form.dataset;
    const desdeEnlace = new URLSearchParams(location.search).get('codigo');
    if (desdeEnlace && meetCode(desdeEnlace)) input.value = meetCode(desdeEnlace);
    input.addEventListener('input', () => { form.classList.remove('is-error'); estado.textContent = ''; });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const code = meetCode(input.value);
      if (!code) {
        form.classList.add('is-error');
        estado.textContent = input.value.trim() ? D.bad : D.empty;
        input.focus();
        return;
      }
      input.value = code;
      const url = `https://meet.google.com/${code}`;
      window.open(url, '_blank', 'noopener');
      form.classList.remove('is-error');
      estado.innerHTML = `${D.opened} <a href="${url}" target="_blank" rel="noopener">${D.retry}</a>`;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initIntro();
    initHeader();
    initMenu();
    initReveal();
    initCounters();
    initParallax();
    initFlow();
    initHero();
    initQuiz();
    initAnatomy();
    initTimeline();
    initModal();
    initVideos();
    initGallery();
    initAtlas();
    initWizard();
    initContact();
    initAgenda();
    initLibrary();
    initPodcast();
    initStudio();
    initAula();
  });
})();
