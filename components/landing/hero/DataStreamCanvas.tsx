"use client";

import { useEffect, useRef } from "react";

import styles from "./DataStreamCanvas.module.css";

const LINES = [
  { x: 6, baseSpeed: 0.6, maxAlpha: 0.14, segmentHeight: 90, gapHeight: 260 },
  { x: 14, baseSpeed: 0.35, maxAlpha: 0.09, segmentHeight: 60, gapHeight: 340 },
  { x: 22, baseSpeed: 0.5, maxAlpha: 0.07, segmentHeight: 45, gapHeight: 400 },
] as const;

const CANVAS_WIDTH = 28;
const STREAM_COLOR = "0, 212, 255";

/**
 * Ambient hero-side data stream.
 *
 * Why this exists:
 * - Adds motion and depth to the hero without competing with the globe.
 * - Stays hidden on mobile and reduced-motion contexts so the public landing
 *   page remains accessible.
 */
export default function DataStreamCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollBoostRef = useRef(0);
  const animationFrameRef = useRef<number>(0);
  const offsetsRef = useRef(LINES.map(() => 0));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (window.innerWidth < 640) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const hero = document.getElementById("hero");

    const resize = () => {
      const height = hero ? hero.offsetHeight : window.innerHeight;
      canvas.height = height;
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    if (hero) {
      resizeObserver.observe(hero);
    }

    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      scrollBoostRef.current = 2.2;
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(() => {
        scrollBoostRef.current = 0;
      }, 150);
    };

    const draw = () => {
      const height = canvas.height;
      const velocity = 1 + scrollBoostRef.current;
      context.clearRect(0, 0, CANVAS_WIDTH, height);

      LINES.forEach((line, index) => {
        const cycle = line.segmentHeight + line.gapHeight;
        offsetsRef.current[index] = (offsetsRef.current[index] + line.baseSpeed * velocity) % cycle;
        const yOffset = offsetsRef.current[index];

        [-cycle, 0, cycle].forEach((extraOffset) => {
          const segmentTop = yOffset + extraOffset - line.segmentHeight;
          const segmentBottom = segmentTop + line.segmentHeight;

          if (segmentBottom < 0 || segmentTop > height) {
            return;
          }

          const gradient = context.createLinearGradient(0, segmentTop, 0, segmentBottom);
          gradient.addColorStop(0, `rgba(${STREAM_COLOR}, 0)`);
          gradient.addColorStop(0.3, `rgba(${STREAM_COLOR}, ${line.maxAlpha})`);
          gradient.addColorStop(0.7, `rgba(${STREAM_COLOR}, ${line.maxAlpha})`);
          gradient.addColorStop(1, `rgba(${STREAM_COLOR}, 0)`);

          context.fillStyle = gradient;
          context.fillRect(
            line.x,
            Math.max(0, segmentTop),
            1,
            Math.min(line.segmentHeight, height - Math.max(0, segmentTop)),
          );
        });
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameRef.current);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resizeObserver.disconnect();

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" width={CANVAS_WIDTH} className={styles.canvas} />;
}
