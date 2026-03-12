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
   SECTION 2: HERO CANVAS ANIMATION
   
   The animation runs a 12-second loop with 3 phases:
   
   PHASE 1 (0s–4s): CO₂ MOLECULES
   - ~24 CO₂ molecules (C atom + 2 O atoms) float and drift
   - Red/orange coloured — representing untracked emissions
   - Mouse cursor attracts molecules within 180px radius
   
   PHASE 2 (4s–8s): SUPPLY CHAIN CONSTELLATION  
   - Molecules fade out, supply chain nodes fade in
   - 7 nodes representing TATA Group's supply chain
   - Animated connection lines draw between nodes
   - Verified nodes glow cyan, unverified glow amber
   - Hover a node to see a tooltip with its data
   
   PHASE 3 (8s–12s): BALANCE SCALE
   - Constellation fades, balance scale fades in
   - Left pan: red cluster = untracked emissions
   - Right pan: cyan documents = verified records
   - Scale tips from left-heavy to balanced
   - Glows green when in balance
   
   Then loops back to Phase 1.
══════════════════════════════════════════════ */

(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  const mouseTrap = document.getElementById('hero-mouse-trap');
  const tooltip = document.getElementById('node-tooltip');

  if (!canvas || !ctx) return;

  // Resize canvas to fill the hero section
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); buildNodes(); });

  // Track mouse position on the right half of hero
  const mouse = { x: null, y: null };
  mouseTrap.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  mouseTrap.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  // ── Easing helpers ──
  function smoothstep(e0, e1, x) {
    const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ── PHASE TIMING (total cycle = 12s) ──
  const CYCLE = 12000;
  // Each phase's alpha = smoothstep in, smoothstep out
  function getAlphas(t) {
    // t = 0..1 through the full cycle
    return {
      mol: smoothstep(0, 0.08, t) * smoothstep(0.42, 0.32, t),
      con: smoothstep(0.28, 0.40, t) * smoothstep(0.72, 0.62, t),
      bal: smoothstep(0.60, 0.72, t) * smoothstep(0.99, 0.88, t),
      // How far into each phase (0..1 within its active window)
      conProgress: Math.max(0, Math.min(1, (t - 0.28) / 0.44)),
      balProgress: Math.max(0, Math.min(1, (t - 0.60) / 0.40)),
    };
  }

  // ══════════════════════════════════════
  // PHASE 1: MOLECULES
  // Each molecule = C atom (centre) + 2 O atoms (sides) + bonds
  // ══════════════════════════════════════
  class Molecule {
    constructor() { this.init(); }
    init() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.r = 5 + Math.random() * 4;       // C atom radius
      this.rot = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.018;
      this.opacity = 0.5 + Math.random() * 0.4;
      // Red-orange palette
      this.hue = 10 + Math.random() * 25;
      this.lit  = 50 + Math.random() * 20;
    }
    update() {
      // Gentle turbulence
      this.vx += (Math.random() - 0.5) * 0.04;
      this.vy += (Math.random() - 0.5) * 0.04;
      // Mouse attraction
      if (mouse.x !== null) {
        const dx = mouse.x - this.x, dy = mouse.y - this.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 200 && d > 0) {
          this.vx += (dx / d) * 0.1;
          this.vy += (dy / d) * 0.1;
        }
      }
      // Damping
      this.vx *= 0.97; this.vy *= 0.97;
      this.x += this.vx; this.y += this.vy;
      this.rot += this.rotSpeed;
      // Wrap around canvas edges
      if (this.x < -60) this.x = canvas.width + 60;
      if (this.x > canvas.width + 60) this.x = -60;
      if (this.y < -60) this.y = canvas.height + 60;
      if (this.y > canvas.height + 60) this.y = -60;
    }
    draw(alpha) {
      const a = this.opacity * alpha;
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      const r = this.r, bond = r * 2.6, oR = r * 0.7;
      // Bond lines
      ctx.beginPath();
      ctx.moveTo(-r, 0); ctx.lineTo(-(r + bond), 0);
      ctx.moveTo(r, 0); ctx.lineTo(r + bond, 0);
      ctx.strokeStyle = `hsla(${this.hue},90%,60%,0.55)`;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      // C atom
      const gC = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      gC.addColorStop(0, `hsla(${this.hue + 15},80%,70%,1)`);
      gC.addColorStop(1, `hsla(${this.hue},90%,${this.lit}%,1)`);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = gC;
      ctx.fill();
      // O atoms
      [-(r + bond + oR), (r + bond + oR)].forEach(ox => {
        const gO = ctx.createRadialGradient(ox, 0, 0, ox, 0, oR);
        gO.addColorStop(0, `hsla(${this.hue - 10},100%,65%,1)`);
        gO.addColorStop(1, `hsla(${this.hue},100%,45%,1)`);
        ctx.beginPath();
        ctx.arc(ox, 0, oR, 0, Math.PI * 2);
        ctx.fillStyle = gO;
        ctx.fill();
      });
      ctx.restore();
    }
  }

  // Build 24 molecules
  const molecules = Array.from({ length: 24 }, () => new Molecule());
  // Focus them on right ~60% of canvas
  molecules.forEach(m => { m.x = canvas.width * 0.4 + Math.random() * canvas.width * 0.6; });

  // ══════════════════════════════════════
  // PHASE 2: SUPPLY CHAIN CONSTELLATION
  // Positions are fractions of canvas (nx, ny = 0..1)
  // The animation draws connection lines progressively
  // ══════════════════════════════════════
  const NODE_DATA = [
    { id:'steel',    nx:0.72, ny:0.30, label:'Primary Steel',    sub:'Jamshedpur · 45,200 tCO₂e', icon:'🏭', verified:true },
    { id:'cement',   nx:0.85, ny:0.52, label:'Cement Works',   sub:'Rajasthan · 28,400 tCO₂e',  icon:'🏗️', verified:true },
    { id:'alum',     nx:0.68, ny:0.66, label:'Aluminium Smelter',sub:'Odisha · 31,800 tCO₂e',     icon:'⚙️', verified:false },
    { id:'logi',     nx:0.57, ny:0.45, label:'Logistics Fleet',   sub:'Pan-India · 8,200 tCO₂e',   icon:'🚛', verified:true },
    { id:'a2z',      nx:0.70, ny:0.42, label:'A2Z Platform',      sub:'Verification Hub · 100%',    icon:'🔐', verified:true, isHub:true },
    { id:'port',     nx:0.50, ny:0.28, label:'Port of Rotterdam', sub:'CBAM Gateway · EU',          icon:'⚓', verified:true },
    { id:'eu',       nx:0.56, ny:0.62, label:'EU Buyer',          sub:'Germany · End Customer',     icon:'🏢', verified:true },
  ];

  const EDGES = [
    ['steel','a2z'],['cement','a2z'],['alum','a2z'],
    ['logi','a2z'],['a2z','port'],['port','eu'],
  ];

  let nodes = [];
  function buildNodes() {
    nodes = NODE_DATA.map(d => ({
      ...d,
      x: d.nx * canvas.width,
      y: d.ny * canvas.height,
      pulseT: Math.random() * Math.PI * 2,
    }));
  }
  buildNodes();

  // Which node is hovered
  let hoveredNode = null;

  function drawConstellation(alpha, progress) {
    if (alpha <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha;

    // Draw edges (progressive — lines draw in as progress increases)
    EDGES.forEach((pair, i) => {
      const edgeProgress = Math.max(0, Math.min(1, (progress - i * 0.08) / 0.25));
      if (edgeProgress <= 0) return;
      const nA = nodes.find(n => n.id === pair[0]);
      const nB = nodes.find(n => n.id === pair[1]);
      if (!nA || !nB) return;
      const ex = nA.x + (nB.x - nA.x) * easeOutCubic(edgeProgress);
      const ey = nA.y + (nB.y - nA.y) * easeOutCubic(edgeProgress);
      ctx.beginPath();
      ctx.moveTo(nA.x, nA.y);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = `rgba(0,212,255,${0.35 * alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // Animated dot travelling along edge
      if (edgeProgress > 0.5) {
        const tp = ((Date.now() / 1200) + i * 0.4) % 1;
        const px = nA.x + (nB.x - nA.x) * tp;
        const py = nA.y + (nB.y - nA.y) * tp;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${0.9 * alpha})`;
        ctx.fill();
      }
    });

    // Draw nodes
    const t = Date.now() / 1000;
    nodes.forEach((nd, i) => {
      const nodeAlpha = Math.max(0, Math.min(1, (progress - i * 0.06) / 0.18));
      if (nodeAlpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha * nodeAlpha;

      const isHovered = hoveredNode === nd.id;
      const pulse = 0.7 + 0.3 * Math.sin(t * 2.2 + nd.pulseT);
      const baseR = nd.isHub ? 18 : 13;
      const R = isHovered ? baseR + 4 : baseR;

      // Glow
      const glowR = R * 2.8 * (isHovered ? 1.4 : 1);
      const gGlow = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, glowR * pulse);
      const glowC = nd.verified ? '0,212,255' : '255,149,0';
      gGlow.addColorStop(0, `rgba(${glowC},${0.25 * pulse})`);
      gGlow.addColorStop(1, `rgba(${glowC},0)`);
      ctx.beginPath();
      ctx.arc(nd.x, nd.y, glowR * pulse, 0, Math.PI * 2);
      ctx.fillStyle = gGlow;
      ctx.fill();

      // Node circle
      const gNode = ctx.createRadialGradient(nd.x - R*0.3, nd.y - R*0.3, 0, nd.x, nd.y, R);
      if (nd.isHub) {
        gNode.addColorStop(0, 'rgba(0,212,255,0.5)');
        gNode.addColorStop(1, 'rgba(0,102,255,0.3)');
      } else {
        gNode.addColorStop(0, `rgba(${nd.verified ? '0,212,255' : '255,149,0'},0.25)`);
        gNode.addColorStop(1, `rgba(${nd.verified ? '0,102,255' : '200,80,0'},0.1)`);
      }
      ctx.beginPath();
      ctx.arc(nd.x, nd.y, R, 0, Math.PI * 2);
      ctx.fillStyle = gNode;
      ctx.fill();
      ctx.strokeStyle = nd.verified ? `rgba(0,212,255,${0.7 * pulse})` : `rgba(255,149,0,${0.7 * pulse})`;
      ctx.lineWidth = nd.isHub ? 2 : 1.5;
      ctx.stroke();

      // Label below node
      ctx.globalAlpha = alpha * nodeAlpha * 0.85;
      ctx.font = `${nd.isHub ? '600' : '500'} 11px 'DM Sans', sans-serif`;
      ctx.fillStyle = nd.verified ? 'rgba(0,212,255,0.95)' : 'rgba(255,149,0,0.95)';
      ctx.textAlign = 'center';
      ctx.fillText(nd.label, nd.x, nd.y + R + 14);

      ctx.restore();
    });

    ctx.restore();
  }

  // Check if mouse is over a node
  function checkNodeHover(mx, my) {
    if (mx === null || my === null) { hoveredNode = null; return; }
    let found = null;
    nodes.forEach(nd => {
      const dx = mx - nd.x, dy = my - nd.y;
      if (Math.sqrt(dx*dx + dy*dy) < (nd.isHub ? 22 : 16)) found = nd.id;
    });
    if (found !== hoveredNode) {
      hoveredNode = found;
      if (found) {
        const nd = nodes.find(n => n.id === found);
        document.getElementById('tt-icon').textContent = nd.icon;
        document.getElementById('tt-label').textContent = nd.label;
        document.getElementById('tt-sub').textContent = nd.sub;
        const badge = document.getElementById('tt-badge');
        badge.textContent = nd.verified ? '✓ Verified' : '⏳ Pending Verification';
        badge.className = 'ntip-badge ' + (nd.verified ? 'verified' : 'pending');
        tooltip.classList.add('vis');
      } else {
        tooltip.classList.remove('vis');
      }
    }
  }

  // Update tooltip position to follow mouse
  document.addEventListener('mousemove', e => {
    tooltip.style.left = (e.clientX + 16) + 'px';
    tooltip.style.top  = (e.clientY - 60) + 'px';
    checkNodeHover(mouse.x, mouse.y);
  });

  // ══════════════════════════════════════
  // PHASE 3: BALANCE SCALE
  // Drawn with canvas 2D paths
  // tilt goes from -18deg (emissions heavy) to +3deg (verified heavy)
  // ══════════════════════════════════════
  function drawBalanceScale(alpha, progress) {
    if (alpha <= 0.01) return;
    // Scale is centred on right 60% of canvas
    const cx = canvas.width * 0.68;
    const cy = canvas.height * 0.46;
    const scale = Math.min(canvas.width, canvas.height) / 600;
    const sz = 160 * scale;

    // Tilt: start at -20deg, ease to +3deg (right side heavier = compliance wins)
    const targetTilt = lerp(-20, 3, easeOutCubic(Math.min(1, progress * 1.3)));
    const tilt = targetTilt * Math.PI / 180;
    const isBalanced = progress > 0.75;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Fulcrum (triangle base)
    ctx.beginPath();
    ctx.moveTo(cx, cy + sz * 0.65);
    ctx.lineTo(cx - sz * 0.12, cy + sz * 0.9);
    ctx.lineTo(cx + sz * 0.12, cy + sz * 0.9);
    ctx.closePath();
    ctx.fillStyle = isBalanced ? 'rgba(0,255,136,0.3)' : 'rgba(0,212,255,0.2)';
    ctx.strokeStyle = isBalanced ? 'rgba(0,255,136,0.8)' : 'rgba(0,212,255,0.6)';
    ctx.lineWidth = 1.5 * scale;
    ctx.fill(); ctx.stroke();

    // Pole
    ctx.beginPath();
    ctx.moveTo(cx, cy - sz * 0.52);
    ctx.lineTo(cx, cy + sz * 0.65);
    ctx.strokeStyle = isBalanced ? 'rgba(0,255,136,0.7)' : 'rgba(0,212,255,0.7)';
    ctx.lineWidth = 2.5 * scale;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Pivot point glow
    const gPiv = ctx.createRadialGradient(cx, cy - sz*0.1, 0, cx, cy - sz*0.1, sz*0.1);
    gPiv.addColorStop(0, isBalanced ? 'rgba(0,255,136,0.6)' : 'rgba(0,212,255,0.5)');
    gPiv.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy - sz*0.1, sz*0.1, 0, Math.PI*2);
    ctx.fillStyle = gPiv;
    ctx.fill();

    // ── Arm (rotated around pivot) ──
    ctx.save();
    ctx.translate(cx, cy - sz * 0.1);
    ctx.rotate(tilt);

    const armL = sz * 0.98;
    // Arm bar
    ctx.beginPath();
    ctx.moveTo(-armL, 0); ctx.lineTo(armL, 0);
    ctx.strokeStyle = isBalanced ? 'rgba(0,255,136,0.9)' : 'rgba(0,212,255,0.85)';
    ctx.lineWidth = 3.5 * scale; ctx.lineCap = 'round';
    ctx.stroke();
    // Arm glow
    ctx.shadowBlur = 12 * scale;
    ctx.shadowColor = isBalanced ? 'rgba(0,255,136,0.5)' : 'rgba(0,212,255,0.5)';
    ctx.stroke();
    ctx.shadowBlur = 0;

    const chainLen = sz * 0.38;
    const panR = sz * 0.22;

    // ── Left pan (emissions — red) ──
    ctx.beginPath();
    ctx.moveTo(-armL, 0); ctx.lineTo(-armL, chainLen);
    ctx.strokeStyle = 'rgba(255,100,50,0.5)'; ctx.lineWidth = 1.5 * scale;
    ctx.stroke();
    // Pan arc
    ctx.beginPath();
    ctx.arc(-armL, chainLen + panR * 0.3, panR, Math.PI * 0.05, Math.PI * 0.95);
    ctx.strokeStyle = 'rgba(255,80,40,0.75)'; ctx.lineWidth = 2 * scale;
    ctx.stroke();
    // Emission blobs in left pan
    const eBlobs = [
      { ox: -12*scale, oy: chainLen - 2*scale, r: 7*scale },
      { ox:  0,        oy: chainLen - 8*scale, r: 9*scale },
      { ox:  11*scale, oy: chainLen - 1*scale, r: 6*scale },
      { ox: -6*scale,  oy: chainLen - 16*scale, r: 5*scale },
    ];
    eBlobs.forEach((b,i) => {
      const g = ctx.createRadialGradient(-armL+b.ox, b.oy, 0, -armL+b.ox, b.oy, b.r);
      g.addColorStop(0, `rgba(255,${80+i*20},0,0.9)`);
      g.addColorStop(1, `rgba(200,40,0,0.4)`);
      ctx.beginPath();
      ctx.arc(-armL + b.ox, b.oy, b.r, 0, Math.PI*2);
      ctx.fillStyle = g;
      ctx.fill();
    });
    // CO₂ label
    ctx.globalAlpha = alpha * 0.6;
    ctx.font = `${10 * scale}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = 'rgba(255,100,50,0.9)';
    ctx.textAlign = 'center';
    ctx.fillText('CO₂', -armL, chainLen + panR * 1.2);
    ctx.globalAlpha = alpha;

    // ── Right pan (verified records — cyan) ──
    ctx.beginPath();
    ctx.moveTo(armL, 0); ctx.lineTo(armL, chainLen);
    ctx.strokeStyle = 'rgba(0,212,255,0.5)'; ctx.lineWidth = 1.5 * scale;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(armL, chainLen + panR * 0.3, panR, Math.PI * 0.05, Math.PI * 0.95);
    ctx.strokeStyle = 'rgba(0,212,255,0.75)'; ctx.lineWidth = 2 * scale;
    ctx.stroke();
    // Document icons in right pan
    const docs = [
      { ox: -14*scale, oy: chainLen - 3*scale },
      { ox:   0,       oy: chainLen - 10*scale },
      { ox:  13*scale, oy: chainLen - 2*scale },
    ];
    docs.forEach(d => {
      const dw = 10*scale, dh = 14*scale;
      const dx = armL + d.ox - dw/2, dy = d.oy - dh/2;
      ctx.fillStyle = 'rgba(0,212,255,0.85)';
      ctx.fillRect(dx, dy, dw, dh);
      ctx.fillStyle = 'rgba(5,10,20,0.9)';
      [0.28, 0.5, 0.72].forEach(fy => ctx.fillRect(dx+2*scale, dy+dh*fy, dw-4*scale, 1.5*scale));
      // Checkmark
      ctx.strokeStyle = 'rgba(0,255,136,0.9)';
      ctx.lineWidth = 1.5*scale; ctx.lineCap='round';
      ctx.beginPath();
      ctx.moveTo(dx+2*scale, dy+1*scale);
      ctx.lineTo(dx+dw-2*scale, dy-5*scale);
      ctx.stroke();
    });
    // Verified label
    ctx.globalAlpha = alpha * 0.7;
    ctx.font = `600 ${10*scale}px 'DM Sans', sans-serif`;
    ctx.fillStyle = isBalanced ? 'rgba(0,255,136,0.95)' : 'rgba(0,212,255,0.9)';
    ctx.textAlign = 'center';
    ctx.fillText(isBalanced ? '✓ VERIFIED' : 'Verified', armL, chainLen + panR * 1.2);
    ctx.globalAlpha = alpha;

    ctx.restore(); // restore arm rotation

    // Ambient glow when balanced
    if (isBalanced) {
      const balAlpha = Math.min(1, (progress - 0.75) * 4);
      const gBal = ctx.createRadialGradient(cx, cy, 0, cx, cy, sz * 1.4);
      gBal.addColorStop(0, `rgba(0,255,136,${0.06 * balAlpha})`);
      gBal.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, sz * 1.4, 0, Math.PI*2);
      ctx.fillStyle = gBal;
      ctx.fill();
    }

    ctx.restore();
  }

  // ══════════════════════════════════════
  // MAIN ANIMATION LOOP
  // ══════════════════════════════════════
  let startTime = null;
  let paused = false;

  // Pause when tab is hidden (saves CPU/battery)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { paused = true; }
    else { paused = false; startTime = null; }
  });

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    if (!paused) {
      const elapsed = timestamp - startTime;
      const t = (elapsed % CYCLE) / CYCLE; // 0..1 through cycle

      const { mol, con, bal, conProgress, balProgress } = getAlphas(t);

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle radial gradient background on right half
      const bgG = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.45, 0,
        canvas.width * 0.7, canvas.height * 0.45, canvas.width * 0.55
      );
      bgG.addColorStop(0, `rgba(0,102,255,${0.06 * Math.max(mol, con, bal)})`);
      bgG.addColorStop(1, 'transparent');
      ctx.fillStyle = bgG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw each phase at its current alpha
      if (mol > 0.01) {
        molecules.forEach(m => { m.update(); m.draw(mol); });
      }
      if (con > 0.01) drawConstellation(con, conProgress);
      if (bal > 0.01) drawBalanceScale(bal, balProgress);
    }
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();


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
