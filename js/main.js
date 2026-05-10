/* ================================================
   KAV — Main JavaScript
   ================================================ */

// === NAV SCROLL ===
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// === MOBILE MENU ===
const toggle = document.querySelector('.nav-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const mobileLinks = document.querySelectorAll('.mobile-nav a');

if (toggle && mobileNav) {
  toggle.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// === SCROLL REVEAL ===
const revealEls = document.querySelectorAll('.reveal');

if (revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

// === SMOOTH SCROLL ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// === COUNTER ANIMATION ===
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    const formatted = target % 1 === 0 ? Math.floor(value) : value.toFixed(1);
    el.textContent = prefix + formatted + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const counters = document.querySelectorAll('[data-target]');
if (counters.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));
}

// === CANCELAR CADASTRO ===
// Substitua os valores abaixo pelas suas credenciais reais
const KAV_CONFIG = {
  API_BASE:             'https://sua-api.com',   // URL base da sua API
  EMAILJS_SERVICE_ID:   'YOUR_SERVICE_ID',       // EmailJS → Email Services
  EMAILJS_TEMPLATE_ID:  'YOUR_TEMPLATE_ID',      // EmailJS → Email Templates
  EMAILJS_PUBLIC_KEY:   'YOUR_PUBLIC_KEY',       // EmailJS → Account → Public Key
};

// Inicializa EmailJS
if (typeof emailjs !== 'undefined') {
  emailjs.init({ publicKey: KAV_CONFIG.EMAILJS_PUBLIC_KEY });
}

// Mostrar/ocultar senha
document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
  });
});

// Formulário de cancelamento
const formCancelar = document.getElementById('form-cancelar');
if (formCancelar) {
  formCancelar.addEventListener('submit', async e => {
    e.preventDefault();

    const email     = document.getElementById('cancel-email').value.trim().toLowerCase();
    const senha     = document.getElementById('cancel-senha').value;
    const submitBtn = document.getElementById('cancel-submit');
    const errorEl   = document.getElementById('cancel-error');
    const errorTitle = document.getElementById('cancel-error-title');
    const errorText  = document.getElementById('cancel-error-text');

    errorEl.hidden = true;
    submitBtn.setAttribute('data-loading', '');
    submitBtn.textContent = 'Verificando...';

    try {
      // 1. Verifica credenciais e solicita token de exclusão na API
      const res = await fetch(`${KAV_CONFIG.API_BASE}/api/auth/request-deletion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: senha }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        errorTitle.textContent = res.status === 401
          ? 'Credenciais inválidas'
          : 'Erro ao processar';
        errorText.textContent = data.message || 'E-mail ou senha incorretos. Verifique e tente novamente.';
        errorEl.hidden = false;
        return;
      }

      // 2. Monta link de confirmação com o token retornado pela API
      const confirmLink =
        `${window.location.origin}/confirm-delete.html` +
        `?token=${encodeURIComponent(data.token)}&email=${encodeURIComponent(email)}`;

      // 3. Envia e-mail de confirmação via EmailJS
      await emailjs.send(KAV_CONFIG.EMAILJS_SERVICE_ID, KAV_CONFIG.EMAILJS_TEMPLATE_ID, {
        to_email:     email,
        confirm_link: confirmLink,
      });

      // 4. Mostra passo de sucesso
      document.getElementById('step-form').hidden       = true;
      document.getElementById('step-email-sent').hidden = false;

    } catch (err) {
      errorTitle.textContent = 'Erro de conexão';
      errorText.textContent  = 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
      errorEl.hidden = false;
    } finally {
      submitBtn.removeAttribute('data-loading');
      submitBtn.textContent = 'Solicitar cancelamento';
    }
  });
}

// === STICKY CTA (LP) ===
const stickyCta = document.querySelector('.sticky-cta');
if (stickyCta) {
  const heroSection = document.querySelector('.lp-hero');
  if (heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        stickyCta.style.display = entry.isIntersecting ? 'none' : 'flex';
      });
    }, { threshold: 0 });
    heroObserver.observe(heroSection);
  }
}
