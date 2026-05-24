/* ============================================
   BIRTHDAY WEBSITE — SCRIPT.JS
   ============================================ */

let stage = 0;
let candlesBlown = 0;
const TOTAL_CANDLES = 24;
let musicStarted = false;
let confettiBurstInterval = null;
let shootingStarsActive = false;
let starsCanvas = null;
let starsCtx = null;
let stars = [];
let shooters = [];
let fireworksEnabled = false;
let sparkleParticles = [];
let sparkleRAF = null;
let sparkleCanvas = null;
let sparkleCtx = null;

/* ══════════════════════════════════════════
   UTILITY
══════════════════════════════════════════ */
function $(id) { return document.getElementById(id); }

function showStage(id) {
  document.querySelectorAll('.stage').forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
  });
  const el = $(id);
  if (el) {
    el.classList.remove('hidden');
    requestAnimationFrame(() =>
      requestAnimationFrame(() => el.classList.add('active'))
    );
  }
}

/* ══════════════════════════════════════════
   MUSIC
══════════════════════════════════════════ */
function startMusic() {
  if (musicStarted) return;
  const music = $('bg-music');
  if (!music) return;
  music.volume = 0;
  music.play().then(() => {
    musicStarted = true;
    let vol = 0;
    const fadeIn = setInterval(() => {
      vol = Math.min(vol + 0.05, 0.8);
      music.volume = vol;
      if (vol >= 0.8) clearInterval(fadeIn);
    }, 150);
  }).catch(err => console.log('Autoplay blocked:', err));
}

/* ══════════════════════════════════════════
   SHOOTING STARS BACKGROUND
══════════════════════════════════════════ */
function initShootingStars() {
  starsCanvas = document.getElementById('stars-canvas');
  if (!starsCanvas) return;
  starsCtx = starsCanvas.getContext('2d');
  resizeStarsCanvas();
  window.addEventListener('resize', resizeStarsCanvas);

  stars = [];
  for (let i = 0; i < 160; i++) {
    stars.push({
      x:     Math.random() * starsCanvas.width,
      y:     Math.random() * starsCanvas.height,
      r:     Math.random() * 1.3 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.012 + 0.004,
      dir:   Math.random() > 0.5 ? 1 : -1
    });
  }
  shooters = [];
  shootingStarsActive = true;
  animateStars();
}

function resizeStarsCanvas() {
  if (!starsCanvas) return;
  starsCanvas.width  = window.innerWidth;
  starsCanvas.height = window.innerHeight;
}

function spawnShooter() {
  const angle = (Math.random() * 30 + 15) * (Math.PI / 180);
  shooters.push({
    x:     Math.random() * starsCanvas.width * 0.7,
    y:     Math.random() * starsCanvas.height * 0.4,
    len:   Math.random() * 120 + 80,
    speed: Math.random() * 8 + 6,
    angle,
    alpha: 1,
    decay: Math.random() * 0.018 + 0.012,
    width: Math.random() * 1.5 + 0.8
  });
}

function animateStars() {
  if (!shootingStarsActive) return;
  starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);

  stars.forEach(s => {
    s.alpha += s.speed * s.dir;
    if (s.alpha >= 1) { s.alpha = 1; s.dir = -1; }
    if (s.alpha <= 0) { s.alpha = 0; s.dir =  1; }
    starsCtx.beginPath();
    starsCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    starsCtx.fillStyle = `rgba(255,255,220,${s.alpha})`;
    starsCtx.fill();
  });

  if (Math.random() < 0.018) spawnShooter();

  shooters.forEach(sh => {
    starsCtx.save();
    starsCtx.globalAlpha = sh.alpha;
    const grad = starsCtx.createLinearGradient(
      sh.x, sh.y,
      sh.x - Math.cos(sh.angle) * sh.len,
      sh.y - Math.sin(sh.angle) * sh.len
    );
    grad.addColorStop(0,   `rgba(255,255,200,${sh.alpha})`);
    grad.addColorStop(0.4, `rgba(255,220,100,${sh.alpha * 0.6})`);
    grad.addColorStop(1,   'rgba(255,200,80,0)');
    starsCtx.strokeStyle = grad;
    starsCtx.lineWidth   = sh.width;
    starsCtx.beginPath();
    starsCtx.moveTo(sh.x, sh.y);
    starsCtx.lineTo(
      sh.x - Math.cos(sh.angle) * sh.len,
      sh.y - Math.sin(sh.angle) * sh.len
    );
    starsCtx.stroke();
    starsCtx.restore();
    sh.x     += Math.cos(sh.angle) * sh.speed;
    sh.y     += Math.sin(sh.angle) * sh.speed;
    sh.alpha -= sh.decay;
  });

  shooters = shooters.filter(sh => sh.alpha > 0);
  requestAnimationFrame(animateStars);
}

/* ══════════════════════════════════════════
   SPARKLE PARTICLE CANVAS
══════════════════════════════════════════ */
function initSparkleCanvas() {
  sparkleCanvas = document.getElementById('sparkle-canvas');
  if (!sparkleCanvas) return;
  sparkleCtx = sparkleCanvas.getContext('2d');
  sparkleCanvas.width  = window.innerWidth;
  sparkleCanvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    if (sparkleCanvas) {
      sparkleCanvas.width  = window.innerWidth;
      sparkleCanvas.height = window.innerHeight;
    }
  });
}

function spawnSparkleParticle() {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  const angle  = Math.random() * Math.PI * 2;
  const radius = 80 + Math.random() * 260;
  sparkleParticles.push({
    x:      cx + Math.cos(angle) * radius * 0.4,
    y:      cy + Math.sin(angle) * radius * 0.5,
    vx:     (Math.random() - 0.5) * 1.8,
    vy:     -(Math.random() * 1.4 + 0.4),
    size:   Math.random() * 4 + 1.5,
    alpha:  1,
    decay:  Math.random() * 0.012 + 0.006,
    pulse:  Math.random() * Math.PI * 2,
    gold:   Math.random() > 0.35,
    isStar: Math.random() > 0.55
  });
}

function drawStar5(ctx, x, y, r, alpha, color) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle   = color;
  ctx.shadowColor = color;
  ctx.shadowBlur  = r * 3;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outerA = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const innerA = outerA + (2 * Math.PI) / 10;
    if (i === 0) ctx.moveTo(x + r * Math.cos(outerA), y + r * Math.sin(outerA));
    else         ctx.lineTo(x + r * Math.cos(outerA), y + r * Math.sin(outerA));
    ctx.lineTo(x + (r * 0.42) * Math.cos(innerA), y + (r * 0.42) * Math.sin(innerA));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function animateSparkles() {
  if (!sparkleCtx) return;
  sparkleCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);

  if (Math.random() < 0.55) spawnSparkleParticle();

  sparkleParticles.forEach(p => {
    p.pulse += 0.12;
    const pulsedAlpha = p.alpha * (0.75 + 0.25 * Math.sin(p.pulse));
    const color = p.gold
      ? `rgba(255,215,0,${pulsedAlpha})`
      : `rgba(255,245,180,${pulsedAlpha})`;

    if (p.isStar) {
      drawStar5(sparkleCtx, p.x, p.y, p.size, pulsedAlpha, p.gold ? '#ffd700' : '#fff5a0');
    } else {
      sparkleCtx.beginPath();
      sparkleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      sparkleCtx.fillStyle   = color;
      sparkleCtx.shadowColor = '#ffd700';
      sparkleCtx.shadowBlur  = p.size * 4;
      sparkleCtx.fill();
      sparkleCtx.shadowBlur  = 0;
    }

    p.x     += p.vx;
    p.y     += p.vy;
    p.alpha -= p.decay;
  });

  sparkleParticles = sparkleParticles.filter(p => p.alpha > 0);
  sparkleRAF = requestAnimationFrame(animateSparkles);
}

function stopSparkles() {
  if (sparkleRAF) {
    cancelAnimationFrame(sparkleRAF);
    sparkleRAF = null;
  }
  sparkleParticles = [];
  if (sparkleCtx && sparkleCanvas) {
    sparkleCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
  }
}

/* ══════════════════════════════════════════
   "TURNING 24" OVERLAY
══════════════════════════════════════════ */
function showTurning24(callback) {
  const overlay = $('turning24-overlay');
  if (!overlay) { if (callback) callback(); return; }

  overlay.classList.remove('hidden');
  overlay.style.opacity = '0';

  initSparkleCanvas();
  animateSparkles();

  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    })
  );

  setTimeout(() => fireworkBurst(), 400);
  setTimeout(() => fireworkBurst(), 900);
  setTimeout(() => fireworkBurst(), 1400);
  setTimeout(() => fireworkBurst(), 1900);
  setTimeout(() => fireworkBurst(), 2400);
  setTimeout(() => fireworkBurst(), 2900);

  setTimeout(() => {
    overlay.style.opacity = '0';
    stopSparkles();
    setTimeout(() => {
      overlay.classList.add('hidden');
      if (callback) callback();
    }, 900);
  }, 3400);
}

function fireworkBurst() {
  if (typeof confetti !== 'function') return;
  const x = 0.1 + Math.random() * 0.8;
  const y = 0.05 + Math.random() * 0.45;
  confetti({
    particleCount: 90,
    spread:        360,
    startVelocity: 40,
    decay:         0.91,
    gravity:       0.75,
    ticks:         300,
    origin:        { x, y },
    colors: ['#ffd700','#ff0044','#ff4400','#ffaa00','#ffffff','#ff69b4','#00eeff'],
    shapes: ['circle'],
    scalar: 1.1
  });
  confetti({
    particleCount: 35,
    spread:        360,
    startVelocity: 58,
    decay:         0.94,
    gravity:       0.5,
    ticks:         340,
    origin:        { x, y },
    colors: ['#ffd700','#ffe680','#ffffff','#ff69b4'],
    shapes: ['star'],
    scalar: 1.5
  });
}

/* ══════════════════════════════════════════
   BUILD RIBBON BANNERS
   Creates scrolling letter strips with drop
   animation and flowing upward scroll effect
══════════════════════════════════════════ */
function buildRibbonBanner(containerId) {
  const container = $(containerId);
  if (!container) return;

  /* Clear any existing content */
  container.innerHTML = '';

  /*
    The phrase repeated enough times to fill
    more than 200% of viewport height so the
    seamless loop always has content visible.
    We duplicate the entire track so CSS can
    loop translateY(-50%) seamlessly.
  */
  const phrase  = 'HAPPY BIRTHDAY';
  const letters = phrase.split('');

  /* Build one "pass" worth of letters + spacer */
  function buildPass() {
    const fragment = document.createDocumentFragment();

    letters.forEach((ch, i) => {
      if (ch === ' ') {
        /* Space between HAPPY and BIRTHDAY */
        const star    = document.createElement('span');
        star.className = 'ribbon-star';
        star.textContent = '✦';
        fragment.appendChild(star);
      } else {
        const span    = document.createElement('span');
        span.className = 'ribbon-letter';
        span.textContent = ch;
        /* Stagger the initial drop animation */
        span.style.animationDelay = (i * 0.06) + 's';
        fragment.appendChild(span);
      }
    });

    /* Decorative spacer between phrase repeats */
    const spacer    = document.createElement('span');
    spacer.className = 'ribbon-spacer';
    fragment.appendChild(spacer);

    /* Second decorative star */
    const starMid    = document.createElement('span');
    starMid.className = 'ribbon-star';
    starMid.textContent = '❋';
    fragment.appendChild(starMid);

    const spacer2    = document.createElement('span');
    spacer2.className = 'ribbon-spacer';
    fragment.appendChild(spacer2);

    return fragment;
  }

  /*
    We need enough passes to fill the track.
    Since ribbonScroll translates -50%, the
    track must be ≥ 200vh tall. Each letter
    is ~1.5rem (~24px) + padding so 14 chars
    ≈ 300px per pass. At 200vh (~1400px) we
    need ~5 passes minimum — use 12 for safety
    across all screen sizes.
  */
  const track    = document.createElement('div');
  track.className = 'ribbon-track';

  for (let p = 0; p < 12; p++) {
    track.appendChild(buildPass());
  }

  container.appendChild(track);
}

/* ══════════════════════════════════════════
   TYPEWRITER EFFECT
══════════════════════════════════════════ */
function typewriterEffect(elementId, text, speed) {
  speed    = speed || 36;
  const el = document.getElementById(elementId);
  if (!el) return;
  el.innerHTML = '';

  const cursor       = document.createElement('span');
  cursor.className   = 'tw-cursor';
  cursor.textContent = '|';

  let i      = 0;
  let output = '';
  let inTag  = false;
  let tagBuf = '';

  function tick() {
    if (i >= text.length) { cursor.remove(); return; }
    const ch = text[i];
    if (ch === '<') { inTag = true; tagBuf = '<'; i++; return tick(); }
    if (inTag) {
      tagBuf += ch;
      if (ch === '>') { inTag = false; output += tagBuf; tagBuf = ''; }
      i++;
      el.innerHTML = output;
      el.appendChild(cursor);
      requestAnimationFrame(tick);
      return;
    }
    output += ch;
    el.innerHTML = output;
    el.appendChild(cursor);
    i++;
    setTimeout(tick, speed);
  }
  tick();
}

/* ══════════════════════════════════════════
   FIREWORKS
══════════════════════════════════════════ */
function launchFirework(ox, oy) {
  if (typeof confetti !== 'function') return;
  confetti({
    particleCount: 80,
    spread:        360,
    startVelocity: 38,
    decay:         0.90,
    gravity:       0.8,
    ticks:         280,
    origin:        { x: ox, y: oy },
    colors: ['#ff0044','#ff4400','#ffaa00','#ffd700','#ffffff','#ff69b4','#00eeff'],
    shapes: ['circle'],
    scalar: 1.1
  });
  confetti({
    particleCount: 40,
    spread:        360,
    startVelocity: 22,
    decay:         0.88,
    gravity:       0.6,
    ticks:         260,
    origin:        { x: ox, y: oy },
    colors: ['#ffd700','#ffe680','#fff0a0','#ffcc00'],
    shapes: ['circle'],
    scalar: 0.7
  });
  confetti({
    particleCount: 25,
    spread:        360,
    startVelocity: 55,
    decay:         0.93,
    gravity:       0.5,
    ticks:         320,
    origin:        { x: ox, y: oy },
    colors: ['#ffffff','#ffd700','#ff69b4','#00fa9a'],
    shapes: ['star'],
    scalar: 1.4
  });
}

function enableFireworks() {
  fireworksEnabled = true;
  document.addEventListener('click',      onFireworkClick);
  document.addEventListener('touchstart', onFireworkTouch, { passive: true });
}

function disableFireworks() {
  fireworksEnabled = false;
  document.removeEventListener('click',      onFireworkClick);
  document.removeEventListener('touchstart', onFireworkTouch);
}

function onFireworkClick(e) {
  if (!fireworksEnabled) return;
  if (e.target && e.target.closest && e.target.closest('button')) return;
  launchFirework(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
}

function onFireworkTouch(e) {
  if (!fireworksEnabled) return;
  if (e.target && e.target.closest && e.target.closest('button')) return;
  if (!e.touches || !e.touches[0]) return;
  launchFirework(
    e.touches[0].clientX / window.innerWidth,
    e.touches[0].clientY / window.innerHeight
  );
}

/* ══════════════════════════════════════════
   CELEBRATE AGAIN
══════════════════════════════════════════ */
function celebrateAgain() {
  burstConfettiCenter();
  setTimeout(burstConfettiSides, 280);
  setTimeout(burstConfettiCenter, 700);
  setTimeout(() => launchFirework(0.20, 0.25), 100);
  setTimeout(() => launchFirework(0.80, 0.20), 350);
  setTimeout(() => launchFirework(0.50, 0.15), 600);
  setTimeout(() => launchFirework(0.15, 0.35), 900);
  setTimeout(() => launchFirework(0.85, 0.30), 1150);
}

/* ══════════════════════════════════════════
   STAGE CONTROLLER
══════════════════════════════════════════ */
function nextStage() {
  stage++;
  switch (stage) {

    case 1:
      startMusic();
      removeBlurOverlay();
      showTurning24(() => {
        showStage('stage-1');
        showBanners();
        setTimeout(() => burstConfettiCenter(), 600);
        setTimeout(() => burstConfettiCenter(), 1800);
        buildConfettiStrip();
        launchBalloons();
      });
      break;

    case 2:
      disableFireworks();
      showStage('stage-2');
      hideBanners();
      buildCandles();
      candlesBlown = 0;
      updateProgress();
      break;

    case 3:
      showStage('stage-3');
      enableFireworks();
      startCelebrationConfetti();
      launchBalloons();
      setTimeout(() => {
        typewriterEffect(
          'wish-text-tw',
          `I hope this little gesture brought a smile to your face and some genuine joy to your day.` +
          ` There is something special about birthdays, they are a chance to wish for everything good for someone 🌟<br/><br/>` +
          `I wish for you a life full of success, abundance and the fulfillment of all your dreams.<br/><br/>` +
          `May you feel God's love and blessings guiding you forward,` +
          ` easing every burden and replacing sorrows with real peace and happiness.<br/><br/>` +
          `Keep being radiant and beautiful self and never stop being who you really are.<br/><br/>`,
          34
        );
      }, 900);
      break;
  }
}

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function removeBlurOverlay() {
  const overlay = $('blur-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 1000);
  }
}

function showBanners() {
  /* Build ribbon content first */
  buildRibbonBanner('banners-left');
  buildRibbonBanner('banners-right');

  ['banners-left','banners-right'].forEach(id => {
    const el = $(id);
    if (el) {
      el.classList.remove('hidden');
      requestAnimationFrame(() => el.classList.add('visible'));
    }
  });
  ['banner-top','banner-bottom'].forEach(id => {
    const el = $(id);
    if (el) {
      el.classList.remove('hidden');
      requestAnimationFrame(() => el.classList.add('visible'));
    }
  });
}

function hideBanners() {
  ['banners-left','banners-right','banner-top','banner-bottom'].forEach(id => {
    const el = $(id);
    if (el) {
      el.classList.remove('visible');
      setTimeout(() => el.classList.add('hidden'), 600);
    }
  });
}

function burstConfettiCenter() {
  if (typeof confetti !== 'function') return;
  confetti({
    particleCount: 180,
    spread:        100,
    startVelocity: 45,
    origin:        { x: 0.5, y: 0.35 },
    colors: [
      '#ff69b4','#ff1493','#ffd700',
      '#ff6347','#00fa9a','#1e90ff',
      '#ff00ff','#ffffff'
    ]
  });
}

function burstConfettiSides() {
  if (typeof confetti !== 'function') return;
  confetti({
    particleCount: 80, angle: 60, spread: 55,
    origin: { x: 0, y: 0.65 },
    colors: ['#ff69b4','#ffd700','#00fa9a']
  });
  confetti({
    particleCount: 80, angle: 120, spread: 55,
    origin: { x: 1, y: 0.65 },
    colors: ['#ff69b4','#ffd700','#00fa9a']
  });
}

function burstConfetti() {
  burstConfettiCenter();
  setTimeout(burstConfettiSides, 300);
}

function startCelebrationConfetti() {
  if (confettiBurstInterval) clearInterval(confettiBurstInterval);
  let count = 0;
  burstConfetti();
  confettiBurstInterval = setInterval(() => {
    burstConfetti();
    count++;
    if (count >= 6) clearInterval(confettiBurstInterval);
  }, 1500);
}

function buildConfettiStrip() {
  const strip = $('confetti-strip');
  if (!strip) return;
  const emojis = ['🎊','🎉','✨','🎈','💕','🌟','🥳','🎂'];
  strip.innerHTML = '';
  for (let i = 0; i < 20; i++) {
    const span             = document.createElement('span');
    span.textContent       = emojis[i % emojis.length];
    span.className         = 'strip-emoji';
    span.style.animationDelay = (i * 0.1) + 's';
    strip.appendChild(span);
  }
}

function launchBalloons() {
  const container = $('balloons-container');
  if (!container) return;
  const emojis = ['🎈','❤️','🎉','🥳','✨','💕','🌟'];
  for (let i = 0; i < 18; i++) {
    const b           = document.createElement('div');
    b.className       = 'balloon';
    b.textContent     = emojis[Math.floor(Math.random() * emojis.length)];
    b.style.left      = (3 + Math.random() * 94) + 'vw';
    b.style.fontSize  = (1.2 + Math.random() * 1.5) + 'rem';
    const dur         = 5 + Math.random() * 4;
    b.style.animationDuration = dur + 's';
    b.style.animationDelay    = (Math.random() * 2) + 's';
    container.appendChild(b);
    setTimeout(() => b.remove(), (dur + 2) * 1000);
  }
}

function buildCandles() {
  const container = $('candles-container');
  if (!container) return;
  container.innerHTML = '';
  const colors = [
    '#ff6b9d','#ffd166','#06d6a0','#118ab2',
    '#ef476f','#a8dadc','#ff9f1c','#e9c46a'
  ];
  for (let i = 0; i < TOTAL_CANDLES; i++) {
    const wrapper     = document.createElement('div');
    wrapper.className = 'candle-wrap';

    const flame       = document.createElement('div');
    flame.className   = 'flame';
    const inner       = document.createElement('div');
    inner.className   = 'flame-inner';
    flame.appendChild(inner);

    const body        = document.createElement('div');
    body.className    = 'candle-body';
    const drip        = document.createElement('div');
    drip.className    = 'wax-drip';
    body.appendChild(drip);

    wrapper.appendChild(flame);
    wrapper.appendChild(body);
    wrapper.addEventListener('click', () => blowCandle(wrapper));

    const c = colors[i % colors.length];
    body.style.background =
      `linear-gradient(to bottom, ${c}, ${shadeColor(c, -30)})`;
    container.appendChild(wrapper);
  }
}

function shadeColor(color, percent) {
  let R = parseInt(color.slice(1,3), 16);
  let G = parseInt(color.slice(3,5), 16);
  let B = parseInt(color.slice(5,7), 16);
  R = Math.min(255, Math.max(0, R + percent));
  G = Math.min(255, Math.max(0, G + percent));
  B = Math.min(255, Math.max(0, B + percent));
  return '#'
    + R.toString(16).padStart(2,'0')
    + G.toString(16).padStart(2,'0')
    + B.toString(16).padStart(2,'0');
}

function blowCandle(wrapper) {
  if (wrapper.classList.contains('blown')) return;
  wrapper.classList.add('blown');
  const smoke       = document.createElement('div');
  smoke.className   = 'smoke';
  wrapper.appendChild(smoke);
  setTimeout(() => smoke.remove(), 1200);
  candlesBlown++;
  updateProgress();
  if (typeof confetti === 'function') {
    const rect = wrapper.getBoundingClientRect();
    confetti({
      particleCount: 15, spread: 30, startVelocity: 20,
      origin: {
        x: (rect.left + rect.width  / 2) / window.innerWidth,
        y:  rect.top                      / window.innerHeight
      },
      colors: ['#ff69b4','#ffd700','#ffffff','#00fa9a']
    });
  }
  if (candlesBlown === TOTAL_CANDLES) {
    setTimeout(() => {
      const btn = $('blow-all-btn');
      if (btn) btn.classList.remove('hidden');
      burstConfettiCenter();
      setTimeout(() => burstConfettiCenter(), 600);
    }, 600);
  }
}

function updateProgress() {
  const el = $('blow-progress');
  if (!el) return;
  el.textContent = `${candlesBlown} / ${TOTAL_CANDLES} blown`;
  if (candlesBlown === TOTAL_CANDLES) {
    el.textContent = '🌬️ All candles blown! Make your wish! 🌙';
    el.style.color = '#ffd700';
  }
}

/* ══════════════════════════════════════════
   DOM READY
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const overlay = $('blur-overlay');
  if (overlay) overlay.style.backgroundImage = "url('your-photo.jpg')";
  setDynamicBackground();
  initShootingStars();
});

function setDynamicBackground() {
  const img       = new Image();
  img.crossOrigin = 'anonymous';
  img.src         = 'your-photo.jpg';
  img.onload = function () {
    const canvas  = document.createElement('canvas');
    canvas.width  = 8;
    canvas.height = 8;
    const ctx     = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 8, 8);
    const data    = ctx.getImageData(0, 0, 8, 8).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]; g += data[i+1]; b += data[i+2]; count++;
    }
    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);
    const dr = Math.floor(r * 0.18);
    const dg = Math.floor(g * 0.18);
    const db = Math.floor(b * 0.18);
    document.body.style.transition = 'background 2s ease';
    document.body.style.background =
      `radial-gradient(ellipse at 60% 40%,
         rgb(${Math.min(dr+18,40)},${Math.min(dg+18,40)},${Math.min(db+18,40)}) 0%,
         rgb(${dr},${dg},${db}) 100%)`;
  };
  img.onerror = function () {
    document.body.style.background = '#0a0a0a';
  };
}