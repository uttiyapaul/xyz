// app/cbam-calculator/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// This file is intentionally thin.
// All logic lives in components/cbam-calculator/CBAMCalculator.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { CBAMCalculator } from "@/components/cbam-calculator";

export const metadata = {
  title: "CBAM Exposure Calculator — A2Z Carbon Solutions",
  description:
    "Calculate your EU Carbon Border Adjustment Mechanism liability for India exports. " +
    "Free, no registration required. Based on EU Regulation 2025/2620.",
};

export default function CBAMCalculatorPage() {
  return <CBAMCalculator />;
}
