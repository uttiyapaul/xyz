import fs from "fs";
import path from "path";
import LandingScripts from "@/components/landing/LandingScripts";
import HeroSection from "@/components/landing/hero/HeroSection";

export const metadata = {
  title: "XYZ-For-Now — Automate Carbon Compliance",
  description:
    "Enterprise carbon management for measurement, capture, and compliance. " +
    "Demo experience tailored to Tata client use cases.",
};

export default function HomePage() {
  const basePath = path.join(process.cwd(), "components", "landing");
  const html = fs.readFileSync(path.join(basePath, "landing-content.html"), "utf8");
  const css = fs.readFileSync(path.join(basePath, "landing-styles.css"), "utf8");

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      {/* 3D WebGL Globe Hero — full viewport, replaces the old canvas animation */}
      <HeroSection />
      {/* Remaining landing page sections */}
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {/* Cookie banner, scroll animations, other client-side scripts */}
      <LandingScripts />
    </>
  );
}
