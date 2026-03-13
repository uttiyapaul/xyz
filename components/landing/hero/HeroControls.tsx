"use client";

import { useState } from "react";

interface HeroControlsProps {
  year: number;
  onYearChange: (year: number) => void;
  showFlights: boolean;
  onToggleFlights: (v: boolean) => void;
  showTrades: boolean;
  onToggleTrades: (v: boolean) => void;
}

export default function HeroControls({
  year,
  onYearChange,
  showFlights,
  onToggleFlights,
  showTrades,
  onToggleTrades,
}: HeroControlsProps) {
  return (
    <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 z-20 px-4">
      {/* Toggles */}
      <div className="flex gap-8 items-center">
        <Toggle
          label="Flight Routes"
          color="#00eaff"
          checked={showFlights}
          onChange={onToggleFlights}
        />
        <Toggle
          label="Carbon Trades"
          color="#ffaa00"
          checked={showTrades}
          onChange={onToggleTrades}
        />
      </div>

      {/* Year slider */}
      <div className="flex items-center gap-4 w-full max-w-xl">
        <span className="text-white/60 text-sm font-mono min-w-[40px]">2000</span>
        <div className="relative flex-1">
          <input
            type="range"
            min={2000}
            max={2024}
            step={1}
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="hero-slider w-full"
          />
        </div>
        <span className="text-white/60 text-sm font-mono min-w-[40px] text-right">2024</span>
        <span
          className="text-white font-bold text-sm font-mono px-3 py-1 rounded-full"
          style={{ background: "rgba(0,234,255,0.15)", border: "1px solid rgba(0,234,255,0.3)" }}
        >
          {year}
        </span>
      </div>

      <style>{`
        .hero-slider {
          -webkit-appearance: none;
          height: 4px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #00eaff ${((year - 2000) / 24) * 100}%, rgba(255,255,255,0.15) ${((year - 2000) / 24) * 100}%);
          outline: none;
        }
        .hero-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #00eaff;
          cursor: pointer;
          box-shadow: 0 0 8px #00eaff;
        }
      `}</style>
    </div>
  );
}

function Toggle({
  label,
  color,
  checked,
  onChange,
}: {
  label: string;
  color: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-10 h-5 rounded-full transition-all duration-300"
        style={{
          background: checked ? `${color}40` : "rgba(255,255,255,0.1)",
          border: `1px solid ${checked ? color : "rgba(255,255,255,0.2)"}`,
          boxShadow: checked ? `0 0 8px ${color}60` : "none",
        }}
      >
        <span
          className="absolute top-0.5 bottom-0.5 w-4 rounded-full transition-all duration-300"
          style={{
            left: checked ? "calc(100% - 18px)" : "2px",
            background: checked ? color : "rgba(255,255,255,0.4)",
            boxShadow: checked ? `0 0 4px ${color}` : "none",
          }}
        />
      </button>
      <span className="text-white/80 text-sm">{label}</span>
    </label>
  );
}
