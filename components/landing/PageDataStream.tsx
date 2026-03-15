"use client";

import { useEffect, useRef } from "react";

import styles from "./PageDataStream.module.css";

const LEFT_LINES = [
  { x: 5, speed: 0.4, maxAlpha: 0.12, segmentHeight: 100, gapHeight: 320 },
  { x: 13, speed: 0.25, maxAlpha: 0.07, segmentHeight: 70, gapHeight: 400 },
  { x: 21, speed: 0.32, maxAlpha: 0.05, segmentHeight: 50, gapHeight: 460 },
] as const;

const RIGHT_LINES = [
  { x: 5, speed: 0.38, maxAlpha: 0.1, segmentHeight: 90, gapHeight: 350 },
  { x: 13, speed: 0.28, maxAlpha: 0.06, segmentHeight: 65, gapHeight: 420 },
  { x: 21, speed: 0.2, maxAlpha: 0.04, segmentHeight: 45, gapHeight: 500 },
] as const;

const CANVAS_WIDTH = 28;
const STREAM_COLOR = "0, 212, 255";

function StreamCanvas({
  side,
  lines,
}: {
  side: "left" | "right";
  lines: typeof LEFT_LINES | typeof RIGHT_LINES;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const offsetsRef = useRef(lines.map(() => Math.random() * 300));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (window.innerWidth < 768) {
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

    const resize = () => {
      canvas.height = window.innerHeight;
    };

    resize();

    const draw = () => {
      const height = canvas.height;
      context.clearRect(0, 0, CANVAS_WIDTH, height);

      lines.forEach((line, index) => {
        const cycle = line.segmentHeight + line.gapHeight;
        offsetsRef.current[index] = (offsetsRef.current[index] + line.speed) % cycle;
        const yOffset = offsetsRef.current[index];

        [-cycle, 0, cycle].forEach((extraOffset) => {
          const segmentTop = yOffset + extraOffset - line.segmentHeight;
          const segmentBottom = segmentTop + line.segmentHeight;

          if (segmentBottom < 0 || segmentTop > height) {
            return;
          }

          const gradient = context.createLinearGradient(0, segmentTop, 0, segmentBottom);
          gradient.addColorStop(0, `rgba(${STREAM_COLOR}, 0)`);
          gradient.addColorStop(0.25, `rgba(${STREAM_COLOR}, ${line.maxAlpha})`);
          gradient.addColorStop(0.75, `rgba(${STREAM_COLOR}, ${line.maxAlpha})`);
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

    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [lines]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      width={CANVAS_WIDTH}
      className={`${styles.canvas} ${side === "left" ? styles.left : styles.right}`}
    />
  );
}

/**
 * Full-page ambient stream.
 *
 * Why this exists:
 * - Keeps subtle movement behind the whole application shell.
 * - Stays decorative only, with zero interaction or state coupling.
 */
export default function PageDataStream() {
  return (
    <>
      <StreamCanvas side="left" lines={LEFT_LINES} />
      <StreamCanvas side="right" lines={RIGHT_LINES} />
    </>
  );
}
