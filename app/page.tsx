import LandingContent from "@/components/landing/LandingContent";
import LandingScripts from "@/components/landing/LandingScripts";
import "@/components/landing/landing-styles.css";

export const metadata = {
  title: "XYZ-For-Now - Automate Carbon Compliance",
  description:
    "Enterprise carbon management for measurement, capture, and compliance. " +
    "Demo experience tailored to Tata client use cases.",
};

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <main id="main">
        {/* The landing stylesheet is imported normally so the page stays CSP-safe and free of runtime HTML injection. */}
        <LandingContent />
      </main>
      <LandingScripts />
    </>
  );
}
