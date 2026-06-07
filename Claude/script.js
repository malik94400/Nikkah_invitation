/**
 * script.js — Nikkah Invitation
 * Maha Malik & Shahzaib Malik · 7 November 2026
 * Pure vanilla JS — no frameworks or libraries
 */

/* ================================================================
   CONSTANTS
================================================================ */
const NIKKAH_DATE = new Date('2026-11-07T10:00:00');
const STORAGE_KEY = 'nikkah_wishes_v1';
const COLORS = ['#e8a0a0','#c97070','#e8d0a0','#c9a060','#f5cece','#b08060'];

/* ================================================================
   1. LOADING SCREEN
================================================================ */
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1800);
});

/* ================================================================
   2. SCROLL PROGRESS BAR
================================================================ */
window.addEventListener('scroll', () => {
    const scrollTop    = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    document.getElementById('scroll-progress').style.width = pct + '%';
}, { passive: true });

/* ================================================================
   3. PETAL CANVAS — falling petals + sparkles
================================================================ */
(function initPetals() {
    const canvas = document.getElementById('petals-canvas');
    const ctx    = canvas.getContext('2d');
    let W, H, petals = [], sparks = [];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function makePetal() {
        return {
            x: Math.random() * W,
            y: -20,
            r: 5 + Math.random() * 8,
            speed: 0.6 + Math.random() * 1.2,
            drift: (Math.random() - 0.5) * 0.6,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.04,
            opacity: 0.4 + Math.random() * 0.5,
            color: ['#e8a0a0','#f5cece','#fce8e8','#e8c0b0'][Math.floor(Math.random()*4)]
        };
    }

    function makeSpark() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: 1 + Math.random() * 2,
            life: 0,
            maxLife: 60 + Math.random() * 80,
            color: COLORS[Math.floor(Math.random()*COLORS.length)]
        };
    }

    for (let i = 0; i < 18; i++) {
        petals.push({ ...makePetal(), y: Math.random() * H });
    }
    for (let i = 0; i < 30; i++) {
        sparks.push(makeSpark());
    }

    function drawPetal(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * 0.6, p.r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawSpark(s) {
        const life = s.life / s.maxLife;
        ctx.save();
        ctx.globalAlpha = (life < 0.5 ? life * 2 : (1 - life) * 2) * 0.6;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * (1 - life * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);

        petals.forEach(p => {
            p.y      += p.speed;
            p.x      += p.drift;
            p.rot    += p.rotSpeed;
            if (p.y > H + 20) { Object.assign(p, makePetal()); }
            drawPetal(p);
        });

        sparks.forEach((s, i) => {
            s.life++;
            if (s.life >= s.maxLife) { sparks[i] = makeSpark(); }
            drawSpark(s);
        });

        requestAnimationFrame(loop);
    }
    loop();
})();

/* ================================================================
   4. SPARKLE FIELD (gate section)
================================================================ */
(function initSparkleField() {
    const field = document.getElementById('sparkle-field');
    if (!field) return;
    for (let i = 0; i < 50; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
      position:absolute;
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      width:${2+Math.random()*4}px;
      height:${2+Math.random()*4}px;
      border-radius:50%;
      background:${COLORS[Math.floor(Math.random()*COLORS.length)]};
      opacity:${0.2+Math.random()*0.5};
      animation: fade-pulse ${2+Math.random()*3}s ease-in-out ${Math.random()*3}s infinite;
    `;
        field.appendChild(dot);
    }
})();

/* ================================================================
   5. INVITATION CARD — 3D OPEN
================================================================ */
(function initCard() {
    const card     = document.getElementById('invitation-card');
    const gate     = document.getElementById('invitation-gate');
    const mainContent = document.getElementById('main-content');

    function openCard() {
        if (gate.classList.contains('hidden')) return;

        // flip card
        card.classList.add('opening');
        card.setAttribute('aria-label','Invitation opening');

        // confetti burst
        spawnConfetti();

        // floating hearts
        for (let i = 0; i < 12; i++) {
            setTimeout(() => spawnHeart(), i * 100);
        }

        // after animation, show main content
        setTimeout(() => {
            gate.classList.add('hidden');
            mainContent.hidden = false;
            mainContent.style.opacity = '0';
            requestAnimationFrame(() => {
                mainContent.style.transition = 'opacity 0.8s ease';
                mainContent.style.opacity = '1';
            });
            initRevealObserver();
            startCountdown();
            loadWishes();
            triggerMessageLines();
        }, 1000);
    }

    card.addEventListener('click', openCard);
    card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(); }
    });
})();

/* ================================================================
   6. CONFETTI
================================================================ */
function spawnConfetti() {
    const container = document.getElementById('confetti-container');
    const count = 80;
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const x = 20 + Math.random() * 60; // vw
        const duration = 1.5 + Math.random() * 2;
        const delay = Math.random() * 0.6;
        const size = 6 + Math.random() * 10;
        piece.style.cssText = `
      left: ${x}vw;
      width: ${size}px; height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation: confetti-fall ${duration}s ${delay}s ease forwards;
      transform: rotate(${Math.random()*360}deg);
    `;
        container.appendChild(piece);
        setTimeout(() => piece.remove(), (duration + delay) * 1000 + 500);
    }
}

/* ================================================================
   7. FLOATING HEARTS
================================================================ */
function spawnHeart() {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = ['❤️','💕','💖','🌸'][Math.floor(Math.random()*4)];
    heart.style.cssText = `
    left: ${10 + Math.random()*80}vw;
    bottom: ${10 + Math.random()*30}vh;
    animation-duration: ${3 + Math.random()*3}s;
    animation-delay: ${Math.random()*0.5}s;
    font-size: ${0.9 + Math.random()*1.4}rem;
  `;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 7000);
}

// periodic hearts while main content visible
setInterval(() => {
    if (document.getElementById('main-content') && !document.getElementById('main-content').hidden) {
        if (Math.random() > 0.6) spawnHeart();
    }
}, 3000);

/* ================================================================
   8. CURSOR SPARKLE (desktop)
================================================================ */
(function initCursor() {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    const el = document.getElementById('cursor-sparkle');
    let lastSparkle = 0;

    document.addEventListener('mousemove', e => {
        el.style.left = e.clientX + 'px';
        el.style.top  = e.clientY + 'px';

        const now = Date.now();
        if (now - lastSparkle > 80) {
            lastSparkle = now;
            const dot = document.createElement('div');
            dot.className = 'sparkle-dot';
            const size = 4 + Math.random() * 8;
            dot.style.cssText = `
        left: ${e.clientX}px; top: ${e.clientY}px;
        width: ${size}px; height: ${size}px;
        background: ${COLORS[Math.floor(Math.random()*COLORS.length)]};
        z-index: 99998;
      `;
            document.body.appendChild(dot);
            setTimeout(() => dot.remove(), 800);
        }
    });
})();

/* ================================================================
   9. SCROLL REVEAL (Intersection Observer)
================================================================ */
function initRevealObserver() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
}

/* ================================================================
   10. COUNTDOWN TIMER
================================================================ */
function startCountdown() {
    const dDays  = document.getElementById('cd-days');
    const dHours = document.getElementById('cd-hours');
    const dMins  = document.getElementById('cd-mins');
    const dSecs  = document.getElementById('cd-secs');

    function update() {
        const now  = new Date();
        const diff = NIKKAH_DATE - now;

        if (diff <= 0) {
            dDays.textContent  = '000';
            dHours.textContent = '00';
            dMins.textContent  = '00';
            dSecs.textContent  = '00';
            return;
        }

        const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins  = Math.floor((diff / (1000 * 60)) % 60);
        const secs  = Math.floor((diff / 1000) % 60);

        function set(el, val, pad) {
            const str = String(val).padStart(pad, '0');
            if (el.textContent !== str) {
                el.classList.remove('flip');
                void el.offsetWidth; // reflow
                el.classList.add('flip');
                el.textContent = str;
            }
        }

        set(dDays,  days,  3);
        set(dHours, hours, 2);
        set(dMins,  mins,  2);
        set(dSecs,  secs,  2);
    }

    update();
    setInterval(update, 1000);
}

/* ================================================================
   11. MESSAGE LINE REVEAL
================================================================ */
function triggerMessageLines() {
    const messageSection = document.getElementById('message');
    if (!messageSection) return;

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            const lines = messageSection.querySelectorAll('.message-line');
            lines.forEach((line, i) => {
                const delay = parseInt(line.dataset.delay || 0, 10);
                setTimeout(() => line.classList.add('visible'), 400 + delay);
            });
            observer.disconnect();
        }
    }, { threshold: 0.3 });

    observer.observe(messageSection);
}

/* ================================================================
   12. GUESTBOOK
================================================================ */
function loadWishes() {
    const list = document.getElementById('wishes-list');
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    stored.forEach(wish => appendWishCard(wish, false));

    document.getElementById('gb-submit').addEventListener('click', () => {
        const name = document.getElementById('gb-name').value.trim();
        const msg  = document.getElementById('gb-message').value.trim();

        if (!name || !msg) {
            if (!name) document.getElementById('gb-name').focus();
            else document.getElementById('gb-message').focus();
            return;
        }

        const wish = { name, msg, time: new Date().toLocaleString() };

        // save
        const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        all.unshift(wish);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 50)));

        appendWishCard(wish, true);

        document.getElementById('gb-name').value    = '';
        document.getElementById('gb-message').value = '';
    });
}

function appendWishCard(wish, prepend) {
    const list = document.getElementById('wishes-list');
    const card = document.createElement('div');
    card.className = 'wish-card glass-card';
    card.innerHTML = `
    <p class="wish-name">✦ ${escHtml(wish.name)}</p>
    <p class="wish-msg">${escHtml(wish.msg)}</p>
    <p class="wish-time">${wish.time}</p>
  `;
    if (prepend) {
        list.prepend(card);
    } else {
        list.appendChild(card);
    }
}

function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ================================================================
   14. GALLERY LIGHTBOX
================================================================ */
(function initGallery() {
    const items    = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const inner    = document.getElementById('lightbox-inner');
    const closeBtn = document.querySelector('.lightbox-close');

    items.forEach(item => {
        item.addEventListener('click', () => {
            const label = item.getAttribute('aria-label') || 'Gallery image';
            inner.innerHTML = `
        <div class="gallery-placeholder" style="
          width:min(400px,80vw); height:min(400px,80vh);
          border-radius:16px; font-size:5rem;
          background:linear-gradient(135deg,#fce8e8,#f5cece);
          display:flex; align-items:center; justify-content:center;
        ">${item.querySelector('span').textContent}</div>`;
            lightbox.hidden = false;
            requestAnimationFrame(() => lightbox.classList.add('active'));
        });
        item.addEventListener('keydown', e => {
            if (e.key === 'Enter') item.click();
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        setTimeout(() => { lightbox.hidden = true; }, 300);
    }

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lightbox.hidden) closeLightbox(); });
})();

/* ================================================================
   15. MUSIC BUTTON (placeholder — web audio beep for demo)
================================================================ */
(function initMusic() {
    const btn = document.getElementById('music-btn');
    let playing = false;

    // Create audio element if it doesn't exist
    let audio = document.getElementById('background-music');
    if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'background-music';
        audio.src = 'music.mp3'; // Replace with your file path
        audio.loop = true;
        audio.volume = 0.3; // Adjust volume (0-1)
        document.body.appendChild(audio);
    }

    btn.addEventListener('click', () => {
        playing = !playing;
        btn.classList.toggle('playing', playing);
        btn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');

        if (playing) {
            audio.play();
        } else {
            audio.pause();
        }
    });
})();

/* ================================================================
   16. PARALLAX (desktop) — subtle hero parallax
================================================================ */
(function initParallax() {
    if (window.matchMedia('(pointer:coarse)').matches) return;

    document.addEventListener('mousemove', e => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;

        const decoL = document.querySelector('.hero-deco-left');
        const decoR = document.querySelector('.hero-deco-right');

        if (decoL) decoL.style.transform = `translateY(calc(-50% + ${dy * 18}px)) translateX(${dx * 12}px)`;
        if (decoR) decoR.style.transform = `translateY(calc(-50% + ${dy * 18}px)) translateX(${-dx * 12}px) scaleX(-1)`;
    }, { passive: true });
})();

/* ================================================================
   17. OCCASIONAL BUTTERFLY
================================================================ */
(function initButterflies() {
    const butterflies = ['🦋','🌸','✨'];

    function spawnButterfly() {
        const el = document.createElement('div');
        const fromLeft = Math.random() > 0.5;
        el.textContent = butterflies[Math.floor(Math.random() * butterflies.length)];
        el.style.cssText = `
      position: fixed;
      top: ${10 + Math.random() * 70}vh;
      ${fromLeft ? 'left:-60px' : 'right:-60px'};
      font-size: ${1.2 + Math.random()}rem;
      z-index: 6;
      pointer-events: none;
      animation: butterfly-cross ${6 + Math.random() * 6}s linear forwards;
      opacity: 0.7;
    `;

        const styleId = 'butterfly-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
        @keyframes butterfly-cross-ltr {
          0%  { transform: translateX(0)   translateY(0)  rotate(-5deg); }
          25% { transform: translateX(30vw) translateY(-20px) rotate(5deg); }
          50% { transform: translateX(60vw) translateY(10px)  rotate(-3deg); }
          100%{ transform: translateX(110vw) translateY(-10px); }
        }
        @keyframes butterfly-cross-rtl {
          0%  { transform: translateX(0)   translateY(0)   rotate(5deg); }
          25% { transform: translateX(-30vw) translateY(-20px) rotate(-5deg); }
          50% { transform: translateX(-60vw) translateY(10px)  rotate(3deg); }
          100%{ transform: translateX(-110vw) translateY(-10px); }
        }
      `;
            document.head.appendChild(style);
        }

        el.style.animationName = fromLeft ? 'butterfly-cross-ltr' : 'butterfly-cross-rtl';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 14000);
    }

    // First after 8 seconds, then every 18–30 seconds
    setTimeout(spawnButterfly, 8000);
    setInterval(spawnButterfly, 18000 + Math.random() * 12000);
})();

/* ================================================================
   18. PAGE TRANSITIONS — smooth anchor scroll
================================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});