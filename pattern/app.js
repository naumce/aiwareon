// ==============================
// DRAPE — Interaction Engine (v3)
// ==============================

// --- State ---
const state = {
  currentScreen: 'splash',
  personImage: null,
  garmentImage: null,
  isProcessing: false,
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  // Splash Screen Logic
  const splashTagline = "See it on you. Before you wear it.";
  typewriterEffect(document.getElementById('splash-tagline'), splashTagline, 50);

  // Initialize tilt effect
  initTiltEffect();

  // Initialize split slider
  initSplitSlider();

  // Handle resize
  window.addEventListener('resize', () => {
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });

  // Initialize theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
});

// --- Theme Toggle ---
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const target = current === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', target);
  localStorage.setItem('theme', target);

  // Animation effect
  const btn = document.querySelector('.theme-toggle');
  if (btn) {
    btn.style.transform = 'rotate(180deg) scale(0.9)';
    setTimeout(() => btn.style.transform = '', 300);
  }
}

// --- Navigation ---
function switchScreen(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.opacity = '0';
    s.style.pointerEvents = 'none';
  });

  // Show target screen
  const target = document.getElementById(`screen-${screenId}`);
  if (target) {
    target.classList.add('active');
    target.style.opacity = '1';
    target.style.pointerEvents = 'auto';
    state.currentScreen = screenId;
  }
}

function goToHome() {
  switchScreen('home');
  const btn = document.querySelector('[data-screen="home"]');
  if (btn) updateNavIndicator(btn);
}

function goToAuth() {
  switchScreen('auth');
}

function goToWardrobe() {
  switchScreen('wardrobe');
  const btn = document.querySelector('[data-screen="wardrobe"]');
  if (btn) updateNavIndicator(btn);
}

// --- Typewriter Effect ---
function typewriterEffect(element, text, speed) {
  if (!element) return;
  let i = 0;
  element.innerHTML = "";
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      const cursor = document.getElementById('splash-cursor');
      if (cursor) cursor.style.display = 'none';
      // Show CTA
      const cta = document.getElementById('splash-cta');
      if (cta) {
        cta.style.opacity = '1';
        cta.style.transform = 'translateY(0)';
        cta.onclick = goToAuth; // Update to go to Auth
      }
    }
  }
  type();
}

// --- Auth Logic ---
function switchAuthMode(mode) {
  // Modes: 'login', 'signup', 'forgot'
  document.querySelectorAll('.auth-form').forEach(f => {
    f.classList.remove('active');
    f.style.transform = 'translateX(20px)';
  });

  const targetForm = document.getElementById(`form-${mode}`);
  if (targetForm) {
    targetForm.classList.add('active');
    setTimeout(() => targetForm.style.transform = 'translateX(0)', 50);
  }

  // Update Headers
  const title = document.querySelector('.auth-title');
  const subtitle = document.querySelector('.auth-subtitle');
  const switchText = document.getElementById('auth-switch-text');

  if (mode === 'login') {
    title.innerText = "Welcome Back";
    subtitle.innerText = "Sign in to continue your style journey";
    switchText.innerHTML = `Don't have an account? <strong onclick="switchAuthMode('signup')">Sign Up</strong>`;
    switchText.style.display = 'block';
  } else if (mode === 'signup') {
    title.innerText = "Join DRAPE";
    subtitle.innerText = "Create an account to start trying on";
    switchText.innerHTML = `Already have an account? <strong onclick="switchAuthMode('login')">Log In</strong>`;
    switchText.style.display = 'block';
  } else if (mode === 'forgot') {
    title.innerText = "Reset Password";
    subtitle.innerText = "We'll help you get back in";
    switchText.style.display = 'none';
  }
}

function handleLogin(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.querySelector('span').innerText;

  btn.querySelector('span').innerText = "Logging in...";
  btn.style.opacity = '0.8';

  setTimeout(() => {
    goToHome();
    btn.querySelector('span').innerText = originalText;
    btn.style.opacity = '1';
  }, 1500);
  return false;
}

function handleSignup(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.querySelector('span').innerText = "Creating Account...";

  setTimeout(() => {
    goToHome();
    // Show welcome celebration
  }, 1500);
  return false;
}

function handleForgot(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.querySelector('span').innerText = "Sending...";

  setTimeout(() => {
    btn.querySelector('span').innerText = "Link Sent! ✓";
    btn.style.background = "#4CAF50";
    setTimeout(() => switchAuthMode('login'), 2000);
  }, 1500);
  return false;
}


// --- Upload Handlers ---
function handleUpload(type) {
  // Simulate file upload with timeout
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.onchange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const imgSrc = event.target.result;
        setUploadImage(type, imgSrc);
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

function setUploadImage(type, src) {
  state[`${type}Image`] = src;

  // Update UI
  const inner = document.getElementById(`${type}-card-inner`);
  const preview = document.getElementById(`${type}-preview`);
  const previewImg = document.getElementById(`${type}-preview-img`);

  if (inner) inner.style.display = 'none';
  if (preview) preview.classList.remove('hidden');
  if (previewImg) previewImg.src = src;

  // Animation
  if (preview) {
    preview.style.opacity = '0';
    setTimeout(() => preview.style.opacity = '1', 50);
  }
}

function resetUpload(type) {
  state[`${type}Image`] = null;
  const inner = document.getElementById(`${type}-card-inner`);
  const preview = document.getElementById(`${type}-preview`);

  if (inner) inner.style.display = 'flex';
  if (preview) preview.classList.add('hidden');
}

// --- Wardrobe Selection ---
function selectGarment(element) {
  const imgSrc = element.dataset.img;
  setUploadImage('garment', imgSrc);

  // Visual feedback
  const originalTransform = element.style.transform;
  element.style.transform = 'scale(0.95)';
  setTimeout(() => element.style.transform = originalTransform, 150);

  // Scroll to top
  const scrollContainer = document.getElementById('home-scroll');
  if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
}

function selectGarmentFromWardrobe(element) {
  const imgSrc = element.dataset.img;
  setUploadImage('garment', imgSrc);
  goToHome();
}

// --- Try-On Logic (The Core) ---
function startTryOn() {
  if (!state.personImage || !state.garmentImage) {
    // Shake animation on upload cards if missing
    if (!state.personImage) shakeElement(document.getElementById('person-card'));
    if (!state.garmentImage) shakeElement(document.getElementById('garment-card'));
    return;
  }

  // Processing UI
  const btn = document.getElementById('try-on-btn');
  const originalText = btn.innerHTML;
  btn.innerHTML = `<div class="processing-spinner"></div> Processing...`;
  btn.style.background = '#ccc';

  setTimeout(() => {
    // Navigate to result
    switchScreen('result');
    const overlay = document.getElementById('processing-overlay');
    if (overlay) overlay.classList.add('active');

    // Set before/after images
    const beforeImg = document.querySelector('.split-before img');
    const afterImg = document.querySelector('.split-after img');

    if (beforeImg) beforeImg.src = state.personImage;
    // For demo: allow 'After' to be a placeholder or the processed result.
    if (afterImg) {
      afterImg.src = state.personImage;
      afterImg.style.filter = "contrast(1.1) saturate(1.2)"; // Fake effect
    }

    // 2.5s Processing Simulation
    setTimeout(() => {
      if (overlay) overlay.classList.remove('active');
      triggerParticleBurst();
      btn.innerHTML = originalText;
      btn.style.background = '';
    }, 2500);
  }, 800);
}

function shakeElement(el) {
  if (!el) return;
  el.style.animation = 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both';
  setTimeout(() => el.style.animation = '', 400);
}

// Add shake keyframes
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}`;
document.head.appendChild(styleSheet);


// --- Split Slider ---
function initSplitSlider() {
  const container = document.getElementById('split-container');
  const handle = document.getElementById('split-handle');
  const after = document.getElementById('split-after');

  if (!container || !handle || !after) return;

  let isDragging = false;

  const updateSplit = (x) => {
    const rect = container.getBoundingClientRect();
    let percentage = ((x - rect.left) / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    handle.style.left = `${percentage}%`;
    after.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
  };

  container.addEventListener('mousedown', () => isDragging = true);
  window.addEventListener('mouseup', () => isDragging = false);
  container.addEventListener('touchstart', () => isDragging = true);
  window.addEventListener('touchend', () => isDragging = false);

  // Fixed: Listen on window to handle fast drags outside container
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateSplit(e.clientX);
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    updateSplit(e.touches[0].clientX);
  });
}

// --- 3D Tilt Effect ---
function initTiltEffect() {
  const cards = document.querySelectorAll('.upload-card, .pick-card, .ward-item');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8; // Max 8deg rotation
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

// --- Bottom Nav ---
function switchTab(btn) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  updateNavIndicator(btn);
}

function updateNavIndicator(btn) {
  const indicator = document.getElementById('nav-indicator');
  const nav = document.getElementById('bottom-nav');
  if (!indicator || !nav) return;

  // Optional: move indicator logic
}

// --- Category Tabs ---
document.querySelectorAll('.cat-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Filter logic would go here
  });
});

// --- Particle Burst System ---
function triggerParticleBurst() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#C9A0FF', '#FF8FAB', '#7DD3C0', '#FFFFFF'];

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15,
      life: 1.0,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 2
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeParticles = false;

    particles.forEach(p => {
      if (p.life > 0) {
        activeParticles = true;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.vy += 0.2; // Gravity

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (activeParticles) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  animate();
}

// --- Motion Polish (Phase 2) ---
function initMotionPolish() {
  const homeScreen = document.getElementById('screen-home');
  if (!homeScreen) return;

  // 1. Staggered Entry Animation
  const triggerEntryAnimation = () => {
    // Temporarily disconnect observer to avoid loop? 
    // Better: Check active state transition
    homeScreen.classList.remove('animate-entry');
    void homeScreen.offsetWidth; // Force reflow
    homeScreen.classList.add('animate-entry');
  };

  // Watch for 'active' class on screen-home
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const wasActive = mutation.oldValue && mutation.oldValue.includes('active');
        const isActive = homeScreen.classList.contains('active');

        // Only trigger if we effectively switched TO this screen
        if (!wasActive && isActive) {
          triggerEntryAnimation();
        }
      }
    });
  });

  // Important: attributeOldValue: true is required to detect state change
  mutationObserver.observe(homeScreen, { attributes: true, attributeOldValue: true });

  // 2. Scroll Reveal
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-visible');
        entry.target.classList.remove('scroll-hidden');
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll('.section-header, .pick-card, .recent-card').forEach(el => {
    el.classList.add('scroll-hidden');
    scrollObserver.observe(el);
  });

  // 3. Enhanced Card Shine
  document.querySelectorAll('.upload-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      card.style.setProperty('--shine-x', `${x}px`);
      card.style.setProperty('--shine-y', `${y}px`);
    });
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initMotionPolish);
