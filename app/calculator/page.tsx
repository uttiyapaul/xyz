import { CBAMCalculator } from "@/components/cbam-calculator";

export const metadata = {
  title: "CBAM Exposure Calculator",
  description:
    "Calculate EU Carbon Border Adjustment Mechanism liability for exports. " +
    "Demo tool for XYZ-For-Now.",
};

export default function CBAMCalculatorPage() {
  return <CBAMCalculator />;
}
