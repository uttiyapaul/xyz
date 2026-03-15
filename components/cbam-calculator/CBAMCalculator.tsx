"use client";

import { useEffect, useState } from "react";

import { CBAM_FACTORS, CBAM_YEARS, CSCF, fetchProducts, type SectorData } from "@/lib/products";

import { CBAMHeader } from "./CBAMHeader";
import styles from "./CBAMCalculator.module.css";
import { EmissionDataPanel } from "./EmissionDataPanel";
import { EmptyState } from "./EmptyState";
import { KPICards } from "./KPICards";
import { LeadCaptureForm } from "./LeadCaptureForm";
import { MarketParameters } from "./MarketParameters";
import { MethodologyNote } from "./MethodologyNote";
import { ProductSelector } from "./ProductSelector";
import { SavingsPanel } from "./SavingsPanel";
import { SectorSelector } from "./SectorSelector";
import { TrajectoryChart } from "./TrajectoryChart";
import { VolumeInput } from "./VolumeInput";
import { YearTable } from "./YearTable";

interface YearRow {
  year: number;
  factor: number;
  costDefault: number;
  costActual: number;
  saving: number;
}

function calcYearlyCosts(
  product: { worldDefault: number; indiaF: number; bmgB: number },
  tonnage: number,
  euaPrice: number,
): YearRow[] {
  const indiaDefault = product.worldDefault * product.indiaF;
  const actualVerified = product.worldDefault * 0.87;

  return CBAM_YEARS.map((year, index) => {
    const factor = CBAM_FACTORS[index];
    const netDefault = Math.max(0, indiaDefault - CSCF * product.bmgB);
    const netActual = Math.max(0, actualVerified - CSCF * product.bmgB);
    const certsDefault = factor * netDefault * tonnage;
    const certsActual = factor * netActual * tonnage;

    return {
      year,
      factor,
      costDefault: certsDefault * euaPrice,
      costActual: certsActual * euaPrice,
      saving: (certsDefault - certsActual) * euaPrice,
    };
  });
}

/**
 * Public CBAM calculator.
 *
 * Why this file matters:
 * - Uses the live sector and product catalog instead of hardcoded demo rows.
 * - Keeps the public estimate lane honest with explicit empty/error states.
 * - Centralizes the calculator layout while the child components own the
 *   individual cards and input surfaces.
 */
export function CBAMCalculator() {
  const [products, setProducts] = useState<Record<string, SectorData>>({});
  const [catalogState, setCatalogState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [sector, setSector] = useState("");
  const [productId, setProductId] = useState("");
  const [tonnage, setTonnage] = useState("");
  const [euaPrice, setEuaPrice] = useState(65);
  const [inrRate, setInrRate] = useState(90);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const result = await fetchProducts();

        if (!active) {
          return;
        }

        const firstSectorEntry = Object.entries(result)[0];

        if (!firstSectorEntry) {
          setProducts({});
          setCatalogState("empty");
          return;
        }

        setProducts(result);
        setCatalogState("ready");
        setSector((current) => (current && result[current] ? current : firstSectorEntry[0]));
      } catch {
        if (active) {
          setProducts({});
          setCatalogState("error");
        }
      }
    }

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!sector) {
      return;
    }

    const sectorProducts = products[sector]?.items ?? [];

    if (sectorProducts.length === 0) {
      setProductId("");
      return;
    }

    if (!sectorProducts.some((product) => product.id === productId)) {
      setProductId(sectorProducts[0].id);
    }
  }, [productId, products, sector]);

  const sectorData = products[sector];
  const product = sectorData?.items.find((item) => item.id === productId) ?? sectorData?.items[0];
  const tonnageNumber = parseFloat(tonnage) || 0;
  const yearData = product ? calcYearlyCosts(product, tonnageNumber, euaPrice) : [];
  const hasResult = tonnageNumber > 0 && yearData.length > 0;

  const cost2026 = yearData[0]?.costDefault ?? 0;
  const cost2030 = yearData[4]?.costDefault ?? 0;
  const cost2034 = yearData[8]?.costDefault ?? 0;
  const saving2034 = yearData[8]?.saving ?? 0;
  const cumulativeSaving = yearData.reduce((sum, row) => sum + row.saving, 0);
  const indiaDefault = product ? product.worldDefault * product.indiaF : 0;
  const actualVerified = product ? product.worldDefault * 0.87 : 0;

  if (catalogState === "loading") {
    return (
      <div className={styles.loadingState}>
        <div>
          <p className={styles.loadingTitle}>Loading calculator catalog</p>
          <p className={styles.loadingCopy}>
            Reading live CBAM sectors and products from the database so the estimate stays tied to the current catalog
            instead of hardcoded demo rows.
          </p>
        </div>
      </div>
    );
  }

  if (catalogState === "error") {
    return (
      <div className={styles.loadingState}>
        <div>
          <p className={styles.loadingTitle}>Calculator catalog unavailable</p>
          <p className={styles.loadingCopy}>
            The public product catalog could not be loaded from the database. Please retry shortly or contact the
            platform team if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  if (catalogState === "empty" || !sectorData || !product) {
    return (
      <div className={styles.loadingState}>
        <div>
          <p className={styles.loadingTitle}>No CBAM products configured</p>
          <p className={styles.loadingCopy}>
            The route is live, but there are no sectors or products available in the current catalog yet. Add the
            required product rows and refresh the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <CBAMHeader />

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <SectorSelector products={products} selected={sector} onSelect={setSector} />
          <ProductSelector sectorData={sectorData} selectedId={productId} onSelect={setProductId} />
          <VolumeInput value={tonnage} onChange={setTonnage} />
          <MarketParameters euaPrice={euaPrice} inrRate={inrRate} onEuaChange={setEuaPrice} onInrChange={setInrRate} />
          <EmissionDataPanel product={product} />
        </aside>

        <main className={styles.results}>
          {!hasResult ? (
            <EmptyState />
          ) : (
            <>
              <KPICards cost2026={cost2026} cost2030={cost2030} cost2034={cost2034} inrRate={inrRate} />

              <SavingsPanel
                saving2034={saving2034}
                cumulativeSaving={cumulativeSaving}
                indiaDefault={indiaDefault}
                actualVerified={actualVerified}
                inrRate={inrRate}
              />

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <p className={styles.sectionEyebrow}>CBAM Cost Trajectory - 2026 to 2034</p>
                </div>
                <TrajectoryChart data={yearData} inrRate={inrRate} />
              </section>

              <YearTable data={yearData} inrRate={inrRate} />
              <MethodologyNote indiaF={product.indiaF} />

              <LeadCaptureForm
                sector={sector}
                productLabel={product.label}
                cnCode={product.cn}
                tonnage={tonnageNumber}
                euaPrice={euaPrice}
                cost2026={cost2026}
                cost2034={cost2034}
                saving2034={saving2034}
                cumulativeSaving={cumulativeSaving}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
