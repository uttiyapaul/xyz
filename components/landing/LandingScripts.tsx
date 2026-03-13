// @ts-nocheck
"use client";

import { useEffect } from "react";

export default function LandingScripts() {
  useEffect(() => {
    
    // Cookie Banner Logic
    const cookieBanner = document.getElementById("cookie-banner");
    const acceptBtn = document.getElementById("cookie-accept");
    const saveBtn = document.getElementById("cookie-save");
    const rejectBtn = document.getElementById("cookie-reject");
    const analyticsToggle = document.getElementById("ck-analytics") as HTMLInputElement | null;
    const marketingToggle = document.getElementById("ck-marketing") as HTMLInputElement | null;
    const cookieKey = "a2z_cookies";

    const hideCookie = () => cookieBanner?.classList.remove("show");
    const showCookie = () => cookieBanner?.classList.add("show");
    
    const saveCookie = () => {
      const payload = {
        analytics: analyticsToggle ? (analyticsToggle as HTMLInputElement).checked : false,
        marketing: marketingToggle ? (marketingToggle as HTMLInputElement).checked : false,
        ts: Date.now(),
      };
      try {
        localStorage.setItem(cookieKey, JSON.stringify(payload));
      } catch (e) {}
      hideCookie();
    };

    let hasPrefs = false;
    try {
      hasPrefs = !!localStorage.getItem(cookieKey);
    } catch (e) {
      hasPrefs = false;
    }
    // Auto-show logic
    if (!hasPrefs) {
      // small delay to let mount happen
      setTimeout(showCookie, 500);
    }

    if (acceptBtn) acceptBtn.addEventListener("click", () => {
      if (analyticsToggle) analyticsToggle.checked = true;
      if (marketingToggle) marketingToggle.checked = true;
      saveCookie();
    });
    
    if (saveBtn) saveBtn.addEventListener("click", saveCookie);
    
    if (rejectBtn) rejectBtn.addEventListener("click", () => {
      if (analyticsToggle) analyticsToggle.checked = false;
      if (marketingToggle) marketingToggle.checked = false;
      saveCookie();
    });

    if (window.innerWidth <= 640) {
  const banner  = document.getElementById("cookie-banner");
  const actions = banner?.querySelector(".ck-actions");
  const acceptBtn = document.getElementById("cookie-accept");

  if (banner && actions) {
    // Inject "Manage" button
    const manageBtn = document.createElement("button");
    manageBtn.className = "ck-manage-mobile";
    manageBtn.textContent = "Manage";
    manageBtn.setAttribute("aria-expanded", "false");

    manageBtn.addEventListener("click", () => {
      const isExpanded = banner.classList.toggle("expanded");
      manageBtn.setAttribute("aria-expanded", String(isExpanded));
      manageBtn.textContent = isExpanded ? "Close" : "Manage";
    });

    // Insert Manage before the first button in actions
    actions.insertBefore(manageBtn, actions.firstChild);

    // Accept all also collapses on mobile
    acceptBtn?.addEventListener("click", () => {
      banner.classList.remove("expanded");
    }, { once: false });
  }
}



'use strict';

/* ══════════════════════════════════════════════
   SECTION 1: COOKIE CONSENT
   HOW IT WORKS:
   - On page load, check localStorage for "a2z_cookies"
   - If not set, show the banner after 1.2 seconds
   - Three buttons: Accept All, Save Preferences, Reject Non-Essential
   - Preferences saved as JSON: {analytics: bool, marketing: bool}
   - Access saved prefs anywhere via window.a2zCookies
══════════════════════════════════════════════ */
const COOKIE_KEY = 'a2z_cookies';

function ckLoad() {
  const saved = localStorage.getItem(COOKIE_KEY);
  if (!saved) {
    setTimeout(() => document.getElementById('cookie-banner').classList.add('show'), 1200);
  } else {
    window.a2zCookies = JSON.parse(saved);
  }
}

function ckSave(analytics, marketing) {
  const prefs = { necessary: true, analytics, marketing, ts: Date.now() };
  localStorage.setItem(COOKIE_KEY, JSON.stringify(prefs));
  window.a2zCookies = prefs;
  document.getElementById('cookie-banner').classList.remove('show');
  // If analytics accepted, load your analytics script here:
  // if (analytics) loadGoogleAnalytics();
}

function ckAcceptAll() {
  document.getElementById('ck-analytics').checked = true;
  document.getElementById('ck-marketing').checked = true;
  ckSave(true, true);
}

function ckRejectAll() {
  document.getElementById('ck-analytics').checked = false;
  document.getElementById('ck-marketing').checked = false;
  ckSave(false, false);
}

function ckSavePrefs() {
  ckSave(
    document.getElementById('ck-analytics').checked,
    document.getElementById('ck-marketing').checked
  );
}

ckLoad();

/* ══════════════════════════════════════════════
   SECTION 3: INTERACTIVE DASHBOARD SCOPE TABS
   Clicking Scope 1/2/3 tabs switches the panel.
   The animated bar chart in Scope 3 re-runs
   its width animation each time it becomes visible.
══════════════════════════════════════════════ */
function switchScope(n) {
  // Update tab active states
  document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-s' + n).classList.add('active');

  // Update panel visibility
  document.querySelectorAll('.sp').forEach(p => p.classList.remove('active'));
  document.getElementById('sp-' + n).classList.add('active');

  // Re-trigger bar chart animation when Scope 3 is selected
  if (n === '3') {
    setTimeout(() => {
      document.querySelectorAll('.s3-bar').forEach(bar => {
        const w = bar.style.width;
        bar.style.width = '0%';
        requestAnimationFrame(() => { bar.style.width = w; });
      });
    }, 50);
  }
}


/* ══════════════════════════════════════════════
   SECTION 4: FAQ ACCORDION
   Click a question to expand/collapse it.
   Only one question open at a time.
══════════════════════════════════════════════ */
function toggleFaq(el) {
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.fq.open').forEach(f => f.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}


/* ══════════════════════════════════════════════
   SECTION 5: SCROLL REVEAL
   Elements with class "rev" fade up into view
   as they enter the viewport.
   Uses IntersectionObserver for performance.
══════════════════════════════════════════════ */
const revObserver = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); }),
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.rev').forEach(el => revObserver.observe(el));


/* ══════════════════════════════════════════════
   SECTION 6: COUNTER ANIMATION
   Elements with class "cu" and data-target count up
   from 0 to their target value when they enter view.
   data-dec sets decimal places (default 0).
══════════════════════════════════════════════ */
const cuObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.dataset.target);
    const dec = parseInt(el.dataset.dec || '0');
    const dur = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(dec);
    }
    requestAnimationFrame(tick);
    cuObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.cu').forEach(el => cuObserver.observe(el));


/* ══════════════════════════════════════════════
   SECTION 7: DEMO FORM SUBMISSION
   
   HOW TO CONNECT TO SUPABASE:
   1. Open your Supabase project → Settings → API
   2. Copy your Project URL and anon key
   3. Replace SUPABASE_URL and SUPABASE_ANON_KEY below
   4. The form inserts into your "leads" table
   
   The leads table needs these columns:
     - first_name (text)
     - last_name (text)
     - email (text)
     - company (text)
     - phone (text, nullable)
     - interest (text)
     - sector (text, nullable)
     - source (text) — will be 'landing-page'
     - created_at (timestamptz, default now())
══════════════════════════════════════════════ */
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';    // ← Replace this
const SUPABASE_KEY = 'YOUR_ANON_KEY';                       // ← Replace this

async function submitDemoForm(e) {
  e.preventDefault();
  const btn = document.getElementById('df-submit');
  const btnText = document.getElementById('df-btn-text');

  // Basic validation
  const required = ['df-fname','df-lname','df-email','df-company','df-interest'];
  let valid = true;
  required.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) { el.style.borderColor='var(--status-critical)'; valid = false; }
    else el.style.borderColor='';
  });
  if (!valid) return;

  // Show loading state
  btn.disabled = true;
  btnText.textContent = 'Booking…';

  const payload = {
    first_name: document.getElementById('df-fname').value.trim(),
    last_name:  document.getElementById('df-lname').value.trim(),
    email:      document.getElementById('df-email').value.trim(),
    company:    document.getElementById('df-company').value.trim(),
    phone:      document.getElementById('df-phone').value.trim() || null,
    interest:   document.getElementById('df-interest').value,
    sector:     document.getElementById('df-sector').value || null,
    source:     'landing-page',
  };

  try {
    // Attempt Supabase insert
    if (SUPABASE_URL !== 'https://YOUR_PROJECT.supabase.co') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('API error ' + res.status);
    }
    // Show success state
    document.getElementById('demo-form-wrap').style.display = 'none';
    document.getElementById('df-success').classList.add('show');
  } catch (err) {
    // If Supabase not yet wired, still show success (demo mode)
    console.warn('Form submit error (demo mode):', err);
    document.getElementById('demo-form-wrap').style.display = 'none';
    document.getElementById('df-success').classList.add('show');
  }
}


/* ══════════════════════════════════════════════
   SECTION 8: NAVBAR SCROLL EFFECT
   Navbar gets a darker background after scrolling 60px.
══════════════════════════════════════════════ */
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


/* ══════════════════════════════════════════════
   SECTION 9: MOBILE BOTTOM TAB BAR — ACTIVE STATE
   Tracks which section is in view and highlights
   the matching tab in the bottom bar.
══════════════════════════════════════════════ */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

const tabSections = [
  { id: 'home',     tab: 'btb-home' },
  { id: 'platform', tab: 'btb-platform' },
  { id: 'amine',    tab: 'btb-amine' },
  { id: 'ccs',      tab: 'btb-ccs' },
];

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const match = tabSections.find(s => s.id === entry.target.id);
    if (!match) return;
    document.querySelectorAll('.btb-item').forEach(t => t.classList.remove('active'));
    const activeTab = document.getElementById(match.tab);
    if (activeTab) activeTab.classList.add('active');
  });
}, { threshold: 0.4 });

tabSections.forEach(s => {
  const el = document.getElementById(s.id);
  if (el) sectionObserver.observe(el);
});

  }, []);
  return null;
}
