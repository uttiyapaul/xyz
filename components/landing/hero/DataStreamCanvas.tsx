"use client";

import { motion } from "framer-motion";

export default function DataStreamCanvas() {
  return (
    <div
      className="absolute left-0 top-0 h-full w-[200px] pointer-events-none z-10"
      aria-hidden="true"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-0 bottom-0"
          style={{
            left: i * 16,
            width: 2,
            background: `linear-gradient(180deg, transparent 0%, #00eaff 30%, #00eaff 70%, transparent 100%)`,
            filter: "blur(1px)",
            opacity: 0.25 + (i % 3) * 0.1,
          }}
          animate={{ y: ["-100%", "100%"] }}
          transition={{
            duration: 6 + i * 0.5,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.4,
          }}
        />
      ))}
      {/* Glowing edge fade */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,20,40,0.6) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
