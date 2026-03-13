"use client";

import { motion } from "framer-motion";

export default function HeroSkeleton() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Starfield fallback */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, #020f1f 0%, #010812 60%, #000 100%)",
        }}
      />
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,234,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,234,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      {/* Globe skeleton — animated glowing ring */}
      <motion.div
        className="relative"
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.97, 1.02, 0.97] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          style={{
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 38% 38%, #1a3a5c 0%, #0d1f38 30%, #020d1a 70%, transparent 100%)",
            boxShadow:
              "0 0 80px rgba(0,234,255,0.15), 0 0 180px rgba(0,234,255,0.06), inset 0 0 60px rgba(0,234,255,0.05)",
            border: "1px solid rgba(0,234,255,0.15)",
          }}
        />
        {/* Animated arc skeleton */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 480 480"
          fill="none"
        >
          <motion.ellipse
            cx="240" cy="240" rx="200" ry="60"
            stroke="rgba(0,234,255,0.2)" strokeWidth="1" fill="none"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0 }}
          />
          <motion.ellipse
            cx="240" cy="240" rx="180" ry="120"
            stroke="rgba(255,170,0,0.15)" strokeWidth="1" fill="none"
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-xs font-mono text-cyan-400/40 tracking-widest"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            LOADING GLOBE…
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
