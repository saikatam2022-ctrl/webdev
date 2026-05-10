/* =====================================================
   LeadForge Digital — Main JavaScript
   Handles: Nav, Tabs, FAQ, Form, Audit Tool, Animations
   ===================================================== */

// ---- UTILITY: DOM ready ----
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initTabs();
  initFAQ();
  initContactForm();
  initScrollAnimations();
  initStickyNav();
});

/* =====================================================
   NAVIGATION
   ===================================================== */
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.classList.toggle('open');
      // Animate hamburger bars
      const spans = hamburger.querySelectorAll('span');
      if (hamburger.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });

    // Close nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        const spans = hamburger.querySelectorAll('span');
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }
}

/* =====================================================
   STICKY NAV on scroll
   ===================================================== */
function initStickyNav() {
  const header = document.getElementById('nav-header');
  if (!header) return;

  const observer = new IntersectionObserver(([entry]) => {
    // When hero is partially out of view, add scrolled class
    if (!entry.isIntersecting) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { threshold: 0.1 });

  const hero = document.getElementById('home');
  if (hero) observer.observe(hero);
}

/* =====================================================
   INDUSTRY TABS
   ===================================================== */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;

      // Update buttons
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update panels
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `tab-${targetTab}`) {
          panel.classList.add('active');
        }
      });
    });
  });
}

/* =====================================================
   FAQ ACCORDION
   ===================================================== */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.classList.contains('open');

      // Close all
      faqItems.forEach(i => {
        i.querySelector('.faq-q').classList.remove('open');
        i.querySelector('.faq-a').classList.remove('open');
      });

      // Toggle current
      if (!isOpen) {
        btn.classList.add('open');
        answer.classList.add('open');
      }
    });
  });
}

// Called from onclick attribute in HTML (FAQ items)
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-a');
  const isOpen = btn.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-q').forEach(q => q.classList.remove('open'));
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));

  if (!isOpen) {
    btn.classList.add('open');
    answer.classList.add('open');
  }
}

/* =====================================================
   CONTACT FORM SUBMISSION
   ===================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-btn');
    const successMsg = document.getElementById('form-success');
    const errorMsg = document.getElementById('form-error');

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#ef4444';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });
    if (!valid) return;

    // Email validation
    const email = form.querySelector('#email');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = '#ef4444';
      return;
    }

    // Loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Collect form data
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData);

    try {
      // POST to backend API endpoint
      // Replace '/api/contact' with your actual endpoint or webhook URL
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        form.style.display = 'none';
        successMsg.style.display = 'block';

        // GA4 event (if configured)
        if (typeof gtag !== 'undefined') {
          gtag('event', 'generate_lead', {
            event_category: 'Form',
            event_label: payload.business_type || 'unknown',
          });
        }

        // Meta Pixel event (if configured)
        if (typeof fbq !== 'undefined') {
          fbq('track', 'Lead');
        }
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      // Fallback: show error or simulate success for demo
      // In production, remove the simulateSuccess block below
      simulateSuccess(form, successMsg, submitBtn);
    }
  });
}

// Demo fallback: simulates a successful submission when backend isn't connected
function simulateSuccess(form, successMsg, submitBtn) {
  // REMOVE in production — replace with proper error handling
  form.style.display = 'none';
  successMsg.style.display = 'block';
  console.log('Demo mode: form submission simulated.');
}

/* =====================================================
   FREE AUDIT TOOL
   ===================================================== */
function runAudit() {
  const input = document.getElementById('audit-url');
  const resultsEl = document.getElementById('audit-results');
  const btn = document.getElementById('audit-btn');

  if (!input || !input.value.trim()) {
    input.style.borderColor = '#ef4444';
    input.focus();
    return;
  }

  input.style.borderColor = '';
  btn.textContent = 'Analyzing...';
  btn.disabled = true;

  // Simulated audit — in production, replace with real API call
  setTimeout(() => {
    // Generate pseudo-random scores for demo effect
    const speedScore = Math.floor(Math.random() * 30) + 35; // 35–65 (typically bad)
    const mobileScore = Math.floor(Math.random() * 25) + 55; // 55–80
    const localScore = Math.floor(Math.random() * 35) + 20;  // 20–55
    const contentScore = Math.floor(Math.random() * 25) + 50; // 50–75
    const overall = Math.floor((speedScore + mobileScore + localScore + contentScore) / 4);

    // Update score ring
    const scoreNum = document.getElementById('score-num');
    const scoreArc = document.getElementById('score-arc');
    if (scoreNum) scoreNum.textContent = overall;
    if (scoreArc) scoreArc.setAttribute('stroke-dasharray', `${overall}, 100`);

    // Update ring color based on score
    if (scoreArc) {
      if (overall < 50) scoreArc.setAttribute('stroke', '#ef4444');
      else if (overall < 70) scoreArc.setAttribute('stroke', '#f59e0b');
      else scoreArc.setAttribute('stroke', '#22c55e');
    }

    // Update bars
    const bars = resultsEl.querySelectorAll('.bar-fill');
    const vals = [speedScore, mobileScore, localScore, contentScore];
    bars.forEach((bar, i) => {
      bar.style.width = vals[i] + '%';
      if (vals[i] < 50) bar.style.background = '#ef4444';
      else if (vals[i] < 70) bar.style.background = '#f59e0b';
      else bar.style.background = '#22c55e';
    });

    // Update labels
    const labels = resultsEl.querySelectorAll('.breakdown-val');
    const labelTexts = vals.map(v => {
      if (v < 50) return ['poor', 'Needs Work'];
      if (v < 70) return ['avg', 'Fair'];
      return ['good', 'Good'];
    });
    labels.forEach((label, i) => {
      label.className = 'breakdown-val ' + labelTexts[i][0];
      label.textContent = labelTexts[i][1];
    });

    // Show results
    resultsEl.style.display = 'block';
    btn.textContent = 'Run Free Audit';
    btn.disabled = false;

    // Smooth scroll to results
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 2200);
}

/* =====================================================
   SCROLL ANIMATIONS (Intersection Observer)
   ===================================================== */
function initScrollAnimations() {
  // Add CSS for animation
  const style = document.createElement('style');
  style.textContent = `
    .animate-in {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .animate-in.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .animate-in.delay-1 { transition-delay: 0.1s; }
    .animate-in.delay-2 { transition-delay: 0.2s; }
    .animate-in.delay-3 { transition-delay: 0.3s; }
    .animate-in.delay-4 { transition-delay: 0.4s; }
  `;
  document.head.appendChild(style);

  // Apply animation class to target elements
  const animTargets = document.querySelectorAll(
    '.service-card, .case-card, .testimonial-card, .process-step, .pricing-card, .faq-item'
  );

  animTargets.forEach((el, i) => {
    el.classList.add('animate-in', `delay-${(i % 4) + 1}`);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  animTargets.forEach(el => observer.observe(el));
}

/* =====================================================
   SMOOTH SCROLL for anchor links
   ===================================================== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* =====================================================
   PHONE MASK for form field
   ===================================================== */
const phoneInput = document.getElementById('phone');
if (phoneInput) {
  phoneInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 0) {
      if (val.length <= 3) val = `(${val}`;
      else if (val.length <= 6) val = `(${val.slice(0,3)}) ${val.slice(3)}`;
      else val = `(${val.slice(0,3)}) ${val.slice(3,6)}-${val.slice(6,10)}`;
    }
    e.target.value = val;
  });
}

/* =====================================================
   COUNTER ANIMATION for trust numbers
   ===================================================== */
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 1500;
  const step = 16;
  const increment = target / (duration / step);

  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      el.textContent = target + suffix;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start) + suffix;
    }
  }, step);
}

// Trigger counter animation when hero trust section is visible
const trustNums = document.querySelectorAll('.trust-num');
const heroObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    const data = [
      { el: trustNums[0], val: 200, suffix: '+' },
      { el: trustNums[1], val: 94, suffix: '%' },
      { el: trustNums[2], val: 3.2, suffix: '×' },
    ];
    data.forEach(({ el, val, suffix }) => {
      if (el) animateCounter(el, val, suffix);
    });
    heroObserver.disconnect();
  }
}, { threshold: 0.5 });

const heroTrust = document.querySelector('.hero-trust');
if (heroTrust) heroObserver.observe(heroTrust);
