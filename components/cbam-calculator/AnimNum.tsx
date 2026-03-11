"use client";

import { useState, useEffect, useRef } from "react";

interface AnimNumProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

/** Animates a number from 0 → value using an ease-out-cubic curve. */
export function AnimNum({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 800,
}: AnimNumProps) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setDisplay(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {display.toLocaleString("en-IN", { maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}
