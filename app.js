// Kportal: clock, status checks, Minecraft status, copy button, shortcuts, starfield.
(() => {
  'use strict';

  const CHECK_EVERY_MS = 60_000;
  const PING_TIMEOUT_MS = 6_000;
  const MC_ADDRESS = 'mc.kportal.net';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Clock ---------- */
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');
  function updateClock() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    timeEl.dateTime = now.toISOString();
    dateEl.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  }
  updateClock();
  // Tick on the minute boundary, then every minute.
  setTimeout(() => { updateClock(); setInterval(updateClock, 60_000); }, 60_000 - (Date.now() % 60_000));
  document.getElementById('year').textContent = String(new Date().getFullYear());

  /* ---------- Status pills ---------- */
  const LABELS = { checking: 'Checking…', online: 'Online', offline: 'Offline' };
  function setStatus(pill, state, text) {
    pill.dataset.state = state;
    pill.querySelector('.status-text').textContent = text || LABELS[state];
  }

  // A static page can't read another site's response, so this is a reachability
  // check: any response at all means the host is up; an error or timeout means it isn't.
  const cards = [...document.querySelectorAll('.card[data-ping]')];
  const summary = document.getElementById('summary');
  const summaryText = document.getElementById('summary-text');

  // Top-left pill: "All services online" or "1 service offline".
  function updateSummary() {
    const services = [
      ...cards.map((c) => ({ name: c.dataset.name, pill: c.querySelector('.status') })),
      { name: 'Minecraft', pill: document.getElementById('mc-status') },
    ];
    if (services.some((s) => s.pill.dataset.state === 'checking')) return;
    const down = services.filter((s) => s.pill.dataset.state === 'offline').map((s) => s.name);
    if (down.length === 0) {
      summary.dataset.state = 'ok';
      summaryText.textContent = 'All services online';
    } else {
      summary.dataset.state = 'warn';
      summaryText.textContent = down.length === 1
        ? `${down[0]} is offline`
        : down.length === 2 ? `${down[0]} and ${down[1]} are offline` : `${down.length} services offline`;
    }
  }

  function pingAll() {
    for (const card of cards) {
      const pill = card.querySelector('.status');
      const name = card.dataset.name;
      const desc = card.querySelector('.card-desc').textContent;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), PING_TIMEOUT_MS);
      fetch(card.dataset.ping, { mode: 'no-cors', cache: 'no-store', signal: ctrl.signal, referrerPolicy: 'no-referrer' })
        .then(() => { setStatus(pill, 'online'); card.setAttribute('aria-label', `${name}: ${desc}. Online`); })
        .catch(() => { setStatus(pill, 'offline'); card.setAttribute('aria-label', `${name}: ${desc}. Offline`); })
        .finally(() => { clearTimeout(timer); updateSummary(); });
    }
  }

  /* ---------- Minecraft ---------- */
  const mcPill = document.getElementById('mc-status');
  const mcPlayers = document.getElementById('mc-players');
  const mcVersion = document.getElementById('mc-version');
  function checkMinecraft() {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10_000);
    fetch(`https://api.mcsrvstat.us/3/${MC_ADDRESS}`, { signal: ctrl.signal, referrerPolicy: 'no-referrer', cache: 'no-store' })
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((d) => {
        if (d && d.online) {
          setStatus(mcPill, 'online');
          const p = d.players || {};
          const online = Number.isFinite(p.online) ? p.online : 0;
          mcPlayers.textContent = Number.isFinite(p.max)
            ? `${online} / ${p.max} players`
            : `${online} ${online === 1 ? 'player' : 'players'}`;
          // Show a short version like "1.21.4" when the server reports one.
          const v = typeof d.version === 'string' ? d.version.match(/\d+\.\d+(\.\d+)?/) : null;
          mcVersion.textContent = v ? `Java ${v[0]}` : '';
        } else {
          setStatus(mcPill, 'offline');
          mcPlayers.textContent = '';
          mcVersion.textContent = '';
        }
      })
      .catch(() => { setStatus(mcPill, 'unknown', 'Status unavailable'); mcPlayers.textContent = ''; mcVersion.textContent = ''; })
      .finally(() => { clearTimeout(timer); updateSummary(); });
  }

  /* ---------- Periodic checks (only while the tab is visible) ---------- */
  let checkTimer = null;
  function runChecks() { pingAll(); checkMinecraft(); }
  function startChecks() {
    if (checkTimer) return;
    runChecks();
    checkTimer = setInterval(runChecks, CHECK_EVERY_MS);
  }
  function stopChecks() { clearInterval(checkTimer); checkTimer = null; }
  document.addEventListener('visibilitychange', () => (document.hidden ? stopChecks() : startChecks()));
  if (!document.hidden) startChecks();

  /* ---------- Copy server address ---------- */
  const copyBtn = document.getElementById('mc-copy');
  const copyLabel = document.getElementById('mc-copy-label');
  const addrEl = document.getElementById('mc-addr');
  let copyReset = null;
  function selectAddress() {
    const range = document.createRange();
    range.selectNodeContents(addrEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  async function copyAddress() {
    clearTimeout(copyReset);
    try {
      await navigator.clipboard.writeText(MC_ADDRESS);
      copyLabel.textContent = 'Copied!';
      copyBtn.dataset.copied = '';
    } catch {
      selectAddress();
      copyLabel.textContent = 'Press ⌘C / Ctrl+C';
    }
    copyReset = setTimeout(() => {
      copyLabel.textContent = 'Copy address';
      delete copyBtn.dataset.copied;
    }, 2000);
  }
  copyBtn.addEventListener('click', copyAddress);

  /* ---------- Keyboard shortcuts: 1–3 open apps, 4 copies the server address ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const el = document.querySelector(`[data-key="${e.key}"]`);
    if (!el) return;
    e.preventDefault();
    if (el.tagName === 'A') window.location.href = el.href;
    else el.click();
  });

  /* ---------- Starfield: sparse, slow twinkle, 30fps, paused when hidden ---------- */
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let dpr = 1;
  let rafId = null;
  let last = 0;

  function buildStars() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const count = Math.round((w * h) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: (Math.random() * 0.8 + 0.35) * dpr,
      base: Math.random() * 0.45 + 0.2,
      speed: Math.random() * 0.6 + 0.25,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const secs = t / 1000;
    for (const s of stars) {
      const twinkle = reduceMotion.matches ? 1 : 0.65 + 0.35 * Math.sin(secs * s.speed + s.phase);
      ctx.globalAlpha = s.base * twinkle;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    rafId = requestAnimationFrame(loop);
    if (t - last < 1000 / 30) return;
    last = t;
    draw(t);
  }

  function startStars() {
    ctx.fillStyle = '#ffffff';
    if (reduceMotion.matches) { cancelAnimationFrame(rafId); rafId = null; draw(0); return; }
    if (!rafId) rafId = requestAnimationFrame(loop);
  }
  function stopStars() { cancelAnimationFrame(rafId); rafId = null; }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { buildStars(); startStars(); }, 150);
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? stopStars() : startStars()));
  reduceMotion.addEventListener('change', () => { stopStars(); startStars(); });

  buildStars();
  startStars();
})();
