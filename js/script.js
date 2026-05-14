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

/* =====================================================
   HOMEPAGE BUILDER — 5-Step Intake Form
   ===================================================== */

(function () {
  // ── State ──
  let hbCur = 1;
  const HB_TOTAL = 5;
  const hbNiches   = [];
  const hbTypes    = [];
  const hbTones    = [];
  const hbColors   = [];
  const hbFonts    = [];
  const hbSections = ['hero'];   // hero pre-selected
  const hbContent  = [];

  // ── Choice toggle (Builder vs Direct Quote) ──
  window.showChoice = function (which) {
    document.getElementById('choice-builder').classList.toggle('choice-active', which === 'builder');
    document.getElementById('choice-quote').classList.toggle('choice-active', which === 'quote');
    document.getElementById('builder-panel').style.display = which === 'builder' ? 'block' : 'none';
    document.getElementById('quote-panel').style.display   = which === 'quote'   ? 'block' : 'none';
  };

  // ── Generic selection handler ──
  function hbSel(gridId, arr, multi) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.querySelectorAll('[data-val]').forEach(el => {
      // Pre-mark already selected
      if (arr.includes(el.dataset.val)) el.classList.add('selected');
      el.addEventListener('click', () => {
        const v = el.dataset.val;
        if (!multi) {
          grid.querySelectorAll('[data-val]').forEach(x => x.classList.remove('selected'));
          arr.length = 0;
          el.classList.add('selected');
          arr.push(v);
          if (gridId === 'hb-niche-grid') {
            document.getElementById('hb-custom-niche-field').style.display = v === 'other' ? 'block' : 'none';
          }
        } else {
          if (el.classList.contains('selected')) {
            el.classList.remove('selected');
            const i = arr.indexOf(v);
            if (i > -1) arr.splice(i, 1);
            const chk = el.querySelector('.hb-fcheck');
            if (chk) chk.textContent = '';
          } else {
            el.classList.add('selected');
            arr.push(v);
            const chk = el.querySelector('.hb-fcheck');
            if (chk) chk.textContent = '✓';
          }
        }
      });
    });
  }

  // ── Colour swatches ──
  function hbInitSwatches() {
    const wrap = document.getElementById('hb-color-swatches');
    if (!wrap) return;
    wrap.querySelectorAll('.hb-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        const v = sw.dataset.val;
        if (sw.classList.contains('selected')) {
          sw.classList.remove('selected');
          const i = hbColors.indexOf(v);
          if (i > -1) hbColors.splice(i, 1);
        } else {
          if (hbColors.length >= 3) { hbShowToast('Max 3 colours!'); return; }
          sw.classList.add('selected');
          hbColors.push(v);
        }
      });
    });
  }

  window.hbAddCustomColor = function (val) {
    const wrap = document.getElementById('hb-custom-swatch-wrap');
    wrap.style.background = val;
    wrap.querySelector('span').style.display = 'none';
    if (!hbColors.includes('custom')) hbColors.push('custom');
  };

  // ── Char counter ──
  window.hbCount = function (el, id) {
    const max = el.getAttribute('maxlength');
    const span = document.getElementById(id);
    if (span) span.textContent = el.value.length + '/' + max;
  };

  // ── Toast ──
  function hbShowToast(msg) {
    const t = document.getElementById('hb-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
  }

  // ── Validation ──
  function hbValidate() {
    if (hbCur === 1) {
      if (!hbNiches.length) { hbShowToast('Please select your niche'); return false; }
      if (hbNiches[0] === 'other' && !document.getElementById('hb-custom-niche').value.trim()) {
        hbShowToast('Please describe your niche'); return false;
      }
      if (!document.getElementById('hb-biz-name').value.trim())     { hbShowToast('Business name required'); return false; }
      if (!document.getElementById('hb-contact-name').value.trim()) { hbShowToast('Your name required'); return false; }
      if (!document.getElementById('hb-biz-email').value.trim())    { hbShowToast('Email required'); return false; }
      if (!document.getElementById('hb-biz-desc').value.trim())     { hbShowToast('Business description required'); return false; }
    }
    if (hbCur === 2) {
      if (!document.getElementById('hb-primary-goal').value)             { hbShowToast('Please select a primary goal'); return false; }
      if (!document.getElementById('hb-target-audience').value.trim())   { hbShowToast('Target audience required'); return false; }
    }
    if (hbCur === 4) {
      if (!document.getElementById('hb-hero-headline').value.trim()) { hbShowToast('Hero headline required'); return false; }
    }
    return true;
  }

  // ── Progress update ──
  function hbUpdateProgress() {
    const pct = ((hbCur - 1) / (HB_TOTAL - 1)) * 100;
    const fill = document.getElementById('hb-fill');
    if (fill) fill.style.width = pct + '%';

    for (let i = 1; i <= HB_TOTAL; i++) {
      const dot = document.getElementById('hb-dot-' + i);
      const lbl = document.getElementById('hb-lbl-' + i);
      if (!dot || !lbl) continue;
      dot.classList.remove('active', 'done');
      lbl.classList.remove('active', 'done');
      if (i < hbCur)      { dot.classList.add('done'); dot.textContent = '✓'; lbl.classList.add('done'); }
      else if (i === hbCur){ dot.classList.add('active'); dot.textContent = i; lbl.classList.add('active'); }
      else                  { dot.textContent = i; }
    }

    const counter = document.getElementById('hb-step-counter');
    if (counter) counter.textContent = 'Step ' + hbCur + ' of ' + HB_TOTAL;

    const prevBtn = document.getElementById('hb-btn-prev');
    if (prevBtn) prevBtn.style.visibility = hbCur > 1 ? 'visible' : 'hidden';

    // Swap Next → Submit on last step
    const nextBtn = document.getElementById('hb-btn-next');
    if (nextBtn) {
      if (hbCur === HB_TOTAL) {
        nextBtn.textContent = '✔ Submit Brief';
        nextBtn.className = 'hb-btn-submit';
        nextBtn.onclick = hbSubmit;
      } else {
        nextBtn.textContent = 'Next →';
        nextBtn.className = 'hb-btn-next';
        nextBtn.onclick = () => hbGo(1);
      }
    }
  }

  // ── Navigate ──
  window.hbGo = function (dir) {
    if (dir === 1 && !hbValidate()) return;
    document.getElementById('hb-p' + hbCur).classList.remove('active');
    hbCur += dir;
    document.getElementById('hb-p' + hbCur).classList.add('active');
    if (hbCur === HB_TOTAL) hbBuildSummary();
    hbUpdateProgress();
    // Scroll builder into view smoothly
    const section = document.getElementById('homepage-builder');
    if (section) {
      const top = section.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // ── Build summary ──
  function hbBuildSummary() {
    const g = (id) => { const el = document.getElementById(id); return el ? el.value : '—'; };
    const trunc = (s, n) => s.length > n ? s.substring(0, n) + '…' : (s || '—');

    const groups = [
      ['Business', {
        'Niche':       hbNiches.join(', ') || '—',
        'Business':    g('hb-biz-name'),
        'Contact':     g('hb-contact-name'),
        'Email':       g('hb-biz-email'),
        'Description': trunc(g('hb-biz-desc'), 100),
      }],
      ['Goals & Audience', {
        'Site type':      hbTypes.join(', ') || '—',
        'Primary goal':   g('hb-primary-goal'),
        'Audience':       trunc(g('hb-target-audience'), 80),
        'USPs':           trunc(g('hb-usps'), 80),
      }],
      ['Brand & Design', {
        'Tone':       hbTones.join(', ')  || '—',
        'Colours':    hbColors.join(', ') || '—',
        'Font style': hbFonts.join(', ')  || '—',
        'Font names': g('hb-font-names'),
      }],
      ['Content & Copy', {
        'Sections':  hbSections.join(', ') || '—',
        'Headline':  g('hb-hero-headline'),
        'Tagline':   g('hb-hero-sub'),
        'CTA':       g('hb-cta1'),
        'Have':      hbContent.join(', ') || '—',
      }],
    ];

    let html = '';
    groups.forEach(([title, obj]) => {
      html += '<div class="hb-summary-card"><h4>' + title + '</h4>';
      Object.entries(obj).forEach(([k, v]) => {
        html += '<div class="hb-summary-row"><span class="hb-sk">' + k + '</span><span class="hb-sv">' + (v || '—') + '</span></div>';
      });
      html += '</div>';
    });
    const area = document.getElementById('hb-summary-area');
    if (area) area.innerHTML = html;
  }

  // ── Submit ──
  function hbSubmit() {
    const g = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
    const data = {
      niche:          hbNiches[0] === 'other' ? g('hb-custom-niche') : (hbNiches[0] || ''),
      businessName:   g('hb-biz-name'),
      contact:        g('hb-contact-name'),
      email:          g('hb-biz-email'),
      existingUrl:    g('hb-existing-url'),
      description:    g('hb-biz-desc'),
      siteType:       hbTypes[0]   || '',
      primaryGoal:    g('hb-primary-goal'),
      targetAudience: g('hb-target-audience'),
      painPoint:      g('hb-pain-point'),
      competitors:    g('hb-competitors'),
      usps:           g('hb-usps'),
      tones:          hbTones,
      colors:         hbColors,
      fontStyle:      hbFonts[0]   || '',
      fontNames:      g('hb-font-names'),
      inspoUrl:       g('hb-inspo-url'),
      visualNotes:    g('hb-visual-notes'),
      sections:       hbSections,
      heroHeadline:   g('hb-hero-headline'),
      heroSub:        g('hb-hero-sub'),
      cta1:           g('hb-cta1'),
      cta2:           g('hb-cta2'),
      years:          g('hb-years'),
      clients:        g('hb-clients'),
      achievements:   g('hb-achievements'),
      contentReady:   hbContent,
      extraNotes:     g('hb-extra-notes'),
      finalNotes:     g('hb-final-notes'),
    };

    // POST to backend (same endpoint as contact form)
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, source: 'homepage-builder', business_type: data.niche, name: data.contact, phone: '' }),
    }).catch(() => {}); // silent fail — show success regardless

    // Show success state
    const wrap = document.querySelector('.builder-form-wrap');
    if (wrap) {
      wrap.innerHTML = `
        <div class="hb-success">
          <div class="hb-success-icon">✅</div>
          <h3>Brief received!</h3>
          <p>Thanks, <strong style="color:var(--accent)">${data.contact || 'there'}</strong>. We'll review your homepage brief and send a custom plan to <strong style="color:var(--accent)">${data.email}</strong> within 24 hours.</p>
          <a href="#" class="btn btn-primary" style="margin:0 auto">Back to Homepage</a>
        </div>`;
    }
  }

  // ── Init (runs after DOM ready) ──
  function hbInit() {
    hbSel('hb-niche-grid',   hbNiches,   false);
    hbSel('hb-type-grid',    hbTypes,    false);
    hbSel('hb-font-grid',    hbFonts,    false);
    hbSel('hb-tone-grid',    hbTones,    true);
    hbSel('hb-section-grid', hbSections, true);
    hbSel('hb-content-grid', hbContent,  true);
    hbInitSwatches();
    hbUpdateProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hbInit);
  } else {
    hbInit();
  }
})();
