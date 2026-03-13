// @ts-nocheck
"use client";

import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import CarbonGlobe from "./CarbonGlobe";

interface GlobeCanvasProps {
  year: number;
  showFlights: boolean;
  showTrades: boolean;
}

export default function GlobeCanvas({ year, showFlights, showTrades }: GlobeCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 280], fov: 50 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[200, 200, 200]} intensity={0.8} />
      <pointLight position={[-200, -200, -200]} intensity={0.3} color="#00eaff" />

      <Stars
        radius={350}
        depth={80}
        count={18000}
        factor={6}
        saturation={0}
        fade
        speed={0.3}
      />

      <CarbonGlobe year={year} showFlights={showFlights} showTrades={showTrades} />

      {/* OrbitControls with autoRotate disabled — rotation handled in CarbonGlobe via useFrame */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate={false}
      />
    </Canvas>
  );
}
