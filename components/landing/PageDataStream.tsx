// @ts-nocheck
"use client";

/**
 * PageDataStream — Full-page ambient data stream.
 *
 * position: fixed — lives across the ENTIRE page, not just hero.
 * Left edge: 3 lines in 28px.  Right edge: 3 lines in 28px (mirrored).
 * Opacity range: 0.06–0.15 — even more subtle than DataStreamCanvas.
 * z-index: 0 — always behind ALL content.
 *
 * Effect: the page feels alive, like data is always flowing.
 * Users will not consciously notice it — they just won't feel static.
 *
 * Mount this in app/layout.tsx (outside the <main> block) so it
 * persists across every page without remounting.
 *
 * Hidden: mobile <768px, prefers-reduced-motion.
 */

import { useEffect, useRef } from "react";

/* ── Stream line definitions ─────────────────────────────────
   Each side has 3 lines at x positions: 5, 13, 21 px
   Slightly slower and more transparent than DataStreamCanvas
   ─────────────────────────────────────────────────────────── */
const LEFT_LINES = [
  { x: 5,  speed: 0.40, maxAlpha: 0.12, segH: 100, gapH: 320 },
  { x: 13, speed: 0.25, maxAlpha: 0.07, segH:  70, gapH: 400 },
  { x: 21, speed: 0.32, maxAlpha: 0.05, segH:  50, gapH: 460 },
] as const;

/* Right lines use same values — canvas is flipped via CSS */
const RIGHT_LINES = [
  { x: 5,  speed: 0.38, maxAlpha: 0.10, segH:  90, gapH: 350 },
  { x: 13, speed: 0.28, maxAlpha: 0.06, segH:  65, gapH: 420 },
  { x: 21, speed: 0.20, maxAlpha: 0.04, segH:  45, gapH: 500 },
] as const;

const CANVAS_W     = 28;
const STREAM_COLOR = "0, 212, 255";

/* ── Single stream canvas (reused for both sides) ─────────── */
function StreamCanvas({
  side,
  lines,
}: {
  side: "left" | "right";
  lines: typeof LEFT_LINES | typeof RIGHT_LINES;
}) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const frameRef   = useRef<number>(0);
  const offsetsRef = useRef(lines.map(() => Math.random() * 300)); // stagger start

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 768) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* Resize to full viewport height */
    function resize() {
      canvas.height        = window.innerHeight;
      canvas.style.height  = window.innerHeight + "px";
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    /* Pause on hidden tab */
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(frameRef.current);
      else frameRef.current = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVis);

    function draw() {
      const h = canvas.height;
      ctx.clearRect(0, 0, CANVAS_W, h);

      lines.forEach((line, i) => {
        const cycle = line.segH + line.gapH;
        offsetsRef.current[i] = (offsetsRef.current[i] + line.speed) % cycle;
        const yOff = offsetsRef.current[i];

        [-cycle, 0, cycle].forEach((extra) => {
          const segTop    = yOff + extra - line.segH;
          const segBottom = segTop + line.segH;
          if (segBottom < 0 || segTop > h) return;

          const grad = ctx.createLinearGradient(0, segTop, 0, segBottom);
          grad.addColorStop(0,   `rgba(${STREAM_COLOR}, 0)`);
          grad.addColorStop(0.25, `rgba(${STREAM_COLOR}, ${line.maxAlpha})`);
          grad.addColorStop(0.75, `rgba(${STREAM_COLOR}, ${line.maxAlpha})`);
          grad.addColorStop(1,   `rgba(${STREAM_COLOR}, 0)`);

          ctx.fillStyle = grad;
          ctx.fillRect(
            line.x,
            Math.max(0, segTop),
            1,
            Math.min(line.segH, h - Math.max(0, segTop))
          );
        });
      });

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []); // eslint-disable-line

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      width={CANVAS_W}
      style={{
        position: "fixed",
        top: 0,
        [side]: 0,
        width: CANVAS_W,
        pointerEvents: "none",
        zIndex: 0,
        willChange: "transform",
      }}
    />
  );
}

/* ── Main export ─────────────────────────────────────────── */
export default function PageDataStream() {
  return (
    <>
      <StreamCanvas side="left"  lines={LEFT_LINES}  />
      <StreamCanvas side="right" lines={RIGHT_LINES} />
    </>
  );
}
