// @ts-nocheck
"use client";

/**
 * DataStreamCanvas — Narrow ambient data-stream effect.
 *
 * Renders on the LEFT edge of the Hero section only.
 * 3 vertical lines, total width 28px.
 * Lines are 1px wide with large gaps — ultra-subtle.
 * Opacity max 0.18 — peripheral, never consciously noticed.
 * Scroll-aware: segments accelerate when user scrolls.
 * Hidden on mobile (<640px) and under prefers-reduced-motion.
 *
 * Why keep this in a <canvas>?
 * The CSS-only version in the mockup looks great in a widget but
 * canvas gives us scroll-speed reactivity and precise frame control.
 */

import { useEffect, useRef } from "react";

/* ── Configuration ───────────────────────────────────────── */
const LINES = [
  { x: 6,  baseSpeed: 0.6,  minAlpha: 0.04, maxAlpha: 0.14, segH: 90,  gapH: 260 },
  { x: 14, baseSpeed: 0.35, minAlpha: 0.03, maxAlpha: 0.09, segH: 60,  gapH: 340 },
  { x: 22, baseSpeed: 0.5,  minAlpha: 0.02, maxAlpha: 0.07, segH: 45,  gapH: 400 },
] as const;

const CANVAS_WIDTH  = 28;
const LINE_WIDTH    = 1;       // px — 1px lines only
const STREAM_COLOR  = "0, 212, 255";  // rgb — brand cyan

export default function DataStreamCanvas() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const scrollRef  = useRef(0);   // current scroll velocity boost
  const frameRef   = useRef<number>(0);
  const offsetsRef = useRef(LINES.map(() => 0));  // per-line y offset

  useEffect(() => {
    /* ── Reduced motion: bail immediately ────────────────── */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* ── Mobile: hide + bail ─────────────────────────────── */
    if (window.innerWidth < 640) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* ── Size canvas to hero section height ─────────────── */
    function resize() {
      const hero = document.getElementById("hero");
      const h    = hero ? hero.offsetHeight : window.innerHeight;
      canvas.height = h;
      canvas.style.height = h + "px";
    }
    resize();
    const ro = new ResizeObserver(resize);
    const hero = document.getElementById("hero");
    if (hero) ro.observe(hero);

    /* ── Scroll listener — boosts speed briefly ──────────── */
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      scrollRef.current = 2.2;   // boost multiplier
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => { scrollRef.current = 0; }, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ── Visibility: pause on hidden tab ─────────────────── */
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frameRef.current);
      } else {
        frameRef.current = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    /* ── Draw loop ───────────────────────────────────────── */
    function draw() {
      const h   = canvas.height;
      const vel = 1 + scrollRef.current;   // scroll multiplier

      ctx.clearRect(0, 0, CANVAS_WIDTH, h);

      LINES.forEach((line, i) => {
        // Advance the offset — wraps around segment+gap cycle
        const cycle = line.segH + line.gapH;
        offsetsRef.current[i] = (offsetsRef.current[i] + line.baseSpeed * vel) % cycle;

        const yOff = offsetsRef.current[i];

        /* Draw two instances of the segment per line —
           one at its natural position, one offset by a full cycle,
           so the canvas always looks full without conditional logic */
        [-cycle, 0, cycle].forEach((extra) => {
          const segTop    = yOff + extra - line.segH;
          const segBottom = segTop + line.segH;

          // Clamp to canvas bounds before drawing
          if (segBottom < 0 || segTop > h) return;

          // Fade in / out at top and bottom of segment (30% of height)
          const fadeZone = line.segH * 0.3;
          const grad     = ctx.createLinearGradient(0, segTop, 0, segBottom);
          grad.addColorStop(0,   `rgba(${STREAM_COLOR}, 0)`);
          grad.addColorStop(0.3, `rgba(${STREAM_COLOR}, ${line.maxAlpha})`);
          grad.addColorStop(0.7, `rgba(${STREAM_COLOR}, ${line.maxAlpha})`);
          grad.addColorStop(1,   `rgba(${STREAM_COLOR}, 0)`);

          ctx.fillStyle = grad;
          ctx.fillRect(line.x, Math.max(0, segTop), LINE_WIDTH, Math.min(line.segH, h - Math.max(0, segTop)));
        });
      });

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      width={CANVAS_WIDTH}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: CANVAS_WIDTH,
        pointerEvents: "none",
        zIndex: 1,
        // GPU compositing hint — prevents repaints
        willChange: "transform",
      }}
    />
  );
}
