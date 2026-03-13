// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { EMISSIONS_DATA, getEmissionForYear, MAX_EMISSION } from "@/data/emissions";
import { FLIGHT_ROUTES } from "@/data/flightRoutes";
import { CARBON_TRADE_ROUTES } from "@/data/carbonTrades";

interface CarbonGlobeProps {
  year: number;
  showFlights: boolean;
  showTrades: boolean;
}

function emissionsColor(normalized: number): string {
  const r = Math.round(normalized * 255);
  const g = Math.round((1 - normalized) * 200 + 55);
  return `rgba(${r},${g},40,0.85)`;
}

export default function CarbonGlobe({ year, showFlights, showTrades }: CarbonGlobeProps) {
  const { scene } = useThree();
  const globeRef = useRef<any>(null);
  const [globeReady, setGlobeReady] = useState(false);

  // Load three-globe dynamically (avoids "window is not defined" during SSR)
  useEffect(() => {
    let cancelled = false;

    import("three-globe").then((mod) => {
      if (cancelled) return;

      const Globe = mod.default;
      const globe = new Globe()
        .globeImageUrl("/textures/earth-dark.jpg")
        .bumpImageUrl("/textures/earth-topology.png")
        .atmosphereColor("#00eaff")
        .atmosphereAltitude(0.18);

      globeRef.current = globe;
      scene.add(globe);
      setGlobeReady(true); // triggers the data useEffect below
    });

    return () => {
      cancelled = true;
      if (globeRef.current) {
        scene.remove(globeRef.current);
        globeRef.current = null;
      }
    };
  }, []); // eslint-disable-line

  // Apply arcs + heatmap data — runs once globe is ready AND whenever props change
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !globeReady) return;

    // --- Heatmap points (emissions) ---
    const points = EMISSIONS_DATA.map((c) => {
      const val = getEmissionForYear(c, year);
      const norm = Math.min(val / MAX_EMISSION, 1);
      return {
        lat: c.lat,
        lng: c.lng,
        size: 0.6 + norm * 2.2,
        color: emissionsColor(norm),
        label: `${c.name}: ${val} MtCO₂ (${year})`,
      };
    });

    globe
      .pointsData(points)
      .pointAltitude(0.01)
      .pointRadius("size")
      .pointColor("color");

    // --- Arcs ---
    const flightArcs = showFlights
      ? FLIGHT_ROUTES.map((r) => ({
          ...r,
          color: ["#00eaff", "#00eaff"],
        }))
      : [];

    const tradeArcs = showTrades
      ? CARBON_TRADE_ROUTES.map((r) => ({
          ...r,
          color: ["#ffaa00", "#ffaa00"],
        }))
      : [];

    globe
      .arcsData([...flightArcs, ...tradeArcs])
      .arcColor("color")
      .arcAltitude(0.28)
      .arcStroke(0.5)
      .arcDashLength(0.4)
      .arcDashGap(4)
      .arcDashAnimateTime(3000);
  }, [globeReady, year, showFlights, showTrades]);

  // Slow auto-rotation
  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.0015;
    }
  });

  return null;
}
