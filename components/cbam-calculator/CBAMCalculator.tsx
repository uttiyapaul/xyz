"use client";

import { useState, useEffect } from "react";
import { fetchProducts, type SectorData } from "@/lib/products";
import { CBAM_YEARS, CBAM_FACTORS, CSCF }  from "@/lib/products";

import { CBAMHeader }        from "./CBAMHeader";
import { SectorSelector }    from "./SectorSelector";
import { ProductSelector }   from "./ProductSelector";
import { VolumeInput }       from "./VolumeInput";
import { MarketParameters }  from "./MarketParameters";
import { EmissionDataPanel } from "./EmissionDataPanel";
import { EmptyState }        from "./EmptyState";
import { KPICards }          from "./KPICards";
import { SavingsPanel }      from "./SavingsPanel";
import { TrajectoryChart }   from "./TrajectoryChart";
import { YearTable }         from "./YearTable";
import { MethodologyNote }   from "./MethodologyNote";
import { LeadCaptureForm }   from "./LeadCaptureForm";

// ─── Inline types (keep co-located with the engine) ──────────────────────────
interface YearRow {
  year: number; factor: number;
  costDefault: number; costActual: number; saving: number;
  indiaDefault: number; actualVerified: number;
}

// ─── Calculation engine (pure — no side effects) ─────────────────────────────
function calcYearlyCosts(
  product: { worldDefault: number; indiaF: number; bmgB: number },
  tonnage: number,
  euaPrice: number,
): YearRow[] {
  const indiaDefault   = product.worldDefault * product.indiaF;
  const actualVerified = product.worldDefault * 0.87;
  return CBAM_YEARS.map((year, i) => {
    const factor       = CBAM_FACTORS[i];
    const netDefault   = Math.max(0, indiaDefault   - CSCF * product.bmgB);
    const netActual    = Math.max(0, actualVerified - CSCF * product.bmgB);
    const certsDefault = factor * netDefault  * tonnage;
    const certsActual  = factor * netActual   * tonnage;
    return {
      year, factor,
      costDefault: certsDefault * euaPrice,
      costActual:  certsActual  * euaPrice,
      saving:      (certsDefault - certsActual) * euaPrice,
      indiaDefault,
      actualVerified,
    };
  });
}

// ─── Root component ───────────────────────────────────────────────────────────
export function CBAMCalculator() {
  const [products,  setProducts]  = useState<Record<string, SectorData>>({});
  const [sector,    setSector]    = useState("steel");
  const [prodId,    setProdId]    = useState("hr_flat");
  const [tonnage,   setTonnage]   = useState("");
  const [euaPrice,  setEuaPrice]  = useState(65);
  const [inrRate,   setInrRate]   = useState(90);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────
  const sectorData = products[sector];
  const product    = sectorData?.items.find((p) => p.id === prodId) ?? sectorData?.items[0];
  const t          = parseFloat(tonnage) || 0;
  const data       = product ? calcYearlyCosts(product, t, euaPrice) : [];
  const hasResult  = t > 0 && data.length > 0;

  const cost2026         = data[0]?.costDefault   ?? 0;
  const cost2030         = data[4]?.costDefault   ?? 0;
  const cost2034         = data[8]?.costDefault   ?? 0;
  const saving2034       = data[8]?.saving        ?? 0;
  const cumulativeSaving = data.reduce((s, d) => s + d.saving, 0);
  const indiaDefault     = product ? product.worldDefault * product.indiaF   : 0;
  const actualVerified   = product ? product.worldDefault * 0.87             : 0;

  // ── Loading guard ───────────────────────────────────────────────────────────
  if (!sectorData || !product) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontFamily: "monospace", color: "#6B7280" }}>
        Loading…
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Georgia','Times New Roman',serif",
        background: "#050508",
        color: "#E8E6DE",
        minHeight: "100vh",
      }}
    >
      {/* Global styles scoped to this subtree */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=range] { accent-color: #F59E0B; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .rc { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      {/* ── Header ── */}
      <CBAMHeader />

      {/* ── Two-column body ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "400px 1fr",
          minHeight: "calc(100vh - 67px)",
        }}
      >
        {/* ── LEFT PANEL: Inputs ── */}
        <div
          style={{
            borderRight: "1px solid #111120",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "22px",
            background: "#07070E",
            overflowY: "auto",
          }}
        >
          <SectorSelector
            products={products}
            selected={sector}
            onSelect={(key) => {
              setSector(key);
              setProdId(products[key].items[0].id);
            }}
          />

          <ProductSelector
            sectorData={sectorData}
            selectedId={prodId}
            onSelect={setProdId}
          />

          <VolumeInput
            value={tonnage}
            onChange={setTonnage}
          />

          <MarketParameters
            euaPrice={euaPrice}
            inrRate={inrRate}
            onEuaChange={setEuaPrice}
            onInrChange={setInrRate}
          />

          <EmissionDataPanel product={product} />
        </div>

        {/* ── RIGHT PANEL: Results ── */}
        <div
          style={{
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            overflowY: "auto",
          }}
        >
          {!hasResult ? (
            <EmptyState />
          ) : (
            <>
              <KPICards
                cost2026={cost2026}
                cost2030={cost2030}
                cost2034={cost2034}
                inrRate={inrRate}
              />

              <SavingsPanel
                saving2034={saving2034}
                cumulativeSaving={cumulativeSaving}
                indiaDefault={indiaDefault}
                actualVerified={actualVerified}
                inrRate={inrRate}
              />

              {/* Trajectory chart */}
              <div
                style={{
                  background: "#0D0D14",
                  border: "1px solid #111120",
                  borderRadius: "4px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "9px",
                    color: "#4B5563",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                  }}
                >
                  CBAM COST TRAJECTORY · 2026 → 2034
                </div>
                <TrajectoryChart data={data} inrRate={inrRate} />
              </div>

              <YearTable data={data} inrRate={inrRate} />

              <MethodologyNote indiaF={product.indiaF} />

              <LeadCaptureForm
                sector={sector}
                productLabel={product.label}
                cnCode={product.cn}
                tonnage={t}
                euaPrice={euaPrice}
                cost2026={cost2026}
                cost2034={cost2034}
                saving2034={saving2034}
                cumulativeSaving={cumulativeSaving}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
