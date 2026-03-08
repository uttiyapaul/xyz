"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { fetchProducts, type Product, type SectorData } from "@/lib/products";
import { CBAM_YEARS, CBAM_FACTORS, CSCF } from "@/lib/products";

interface YearRow {
  year: number; factor: number;
  costDefault: number; costActual: number; saving: number;
  indiaDefault: number; actualVerified: number;
}

// ─── CALCULATION ENGINE ───────────────────────────────────────────────────────
function calcYearlyCosts(product: Product, tonnage: number, euaPrice: number): YearRow[] {
  const indiaDefault   = product.worldDefault * product.indiaF;
  const actualVerified = product.worldDefault * 0.87;
  return CBAM_YEARS.map((year, i) => {
    const factor      = CBAM_FACTORS[i];
    const netDefault  = Math.max(0, indiaDefault   - CSCF * product.bmgB);
    const netActual   = Math.max(0, actualVerified - CSCF * product.bmgB);
    const certsDefault = factor * netDefault  * tonnage;
    const certsActual  = factor * netActual   * tonnage;
    return {
      year, factor,
      costDefault: certsDefault * euaPrice,
      costActual:  certsActual  * euaPrice,
      saving:      (certsDefault - certsActual) * euaPrice,
      indiaDefault, actualVerified,
    };
  });
}

// ─── ANIMATED NUMBER ──────────────────────────────────────────────────────────
function AnimNum({ value, prefix="", suffix="", decimals=0 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / 800, 1);
      setDisplay(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);
  return <span>{prefix}{display.toLocaleString("en-IN",{maximumFractionDigits:decimals})}{suffix}</span>;
}

// ─── TRAJECTORY CHART ────────────────────────────────────────────────────────
function TrajectoryChart({ data, inrRate }: { data: YearRow[]; inrRate: number }) {
  const maxCost = Math.max(...data.map(d => d.costDefault));
  if (maxCost === 0) return (
    <div style={{textAlign:"center",color:"#4B5563",padding:"40px 0",fontFamily:"monospace",fontSize:"12px"}}>
      Enter export volume to see projection
    </div>
  );
  return (
    <div style={{padding:"4px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
        <div style={{display:"flex",gap:"20px",fontSize:"10px",fontFamily:"monospace"}}>
          <span style={{color:"#F59E0B"}}>▬ India default values</span>
          <span style={{color:"#22C55E"}}>▬ Verified actual emissions</span>
        </div>
      </div>
      {data.map((d) => {
        const wD = (d.costDefault / maxCost) * 100;
        const wA = (d.costActual  / maxCost) * 100;
        const key = d.year===2026||d.year===2030||d.year===2034;
        return (
          <div key={d.year} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"6px"}}>
            <span style={{fontFamily:"monospace",fontSize:"11px",width:"36px",flexShrink:0,color:key?"#FAFAF8":"#6B7280",fontWeight:key?"700":"400"}}>{d.year}</span>
            <div style={{flex:1,position:"relative",height:"24px"}}>
              <div style={{position:"absolute",top:0,left:0,height:"24px",width:`${wD}%`,background:key?"#F59E0B":"#F59E0B55",borderRadius:"2px",transition:"width 0.6s ease",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"6px"}}>
                {wD > 25 && <span style={{fontSize:"10px",fontFamily:"monospace",color:"#000",fontWeight:"700"}}>€{Math.round(d.costDefault).toLocaleString("en-IN")}</span>}
              </div>
              <div style={{position:"absolute",top:"6px",left:0,height:"12px",width:`${wA}%`,background:"#22C55E",borderRadius:"1px",opacity:0.85,transition:"width 0.6s ease 0.1s"}}/>
            </div>
            {d.saving > 0 && (
              <span style={{fontFamily:"monospace",fontSize:"10px",color:"#22C55E",width:"90px",flexShrink:0,textAlign:"right"}}>
                save ₹{Math.round(d.saving*inrRate/100000).toLocaleString("en-IN")}L
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function CalculatorPage() {
  const [PRODUCTS, setPRODUCTS] = useState<Record<string, SectorData>>({});
  const [sector,    setSector]    = useState("steel");
  const [prodId,    setProdId]    = useState("hr_flat");
  const [tonnage,   setTonnage]   = useState("");
  const [euaPrice,  setEuaPrice]  = useState(65);
  const [inrRate,   setInrRate]   = useState(90);
  const [email,     setEmail]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchProducts().then(setPRODUCTS);
  }, []);

  const sectorData = PRODUCTS[sector];
  const product    = sectorData?.items.find(p => p.id === prodId) ?? sectorData?.items[0];
  const t          = parseFloat(tonnage) || 0;
  const data       = product ? calcYearlyCosts(product, t, euaPrice) : [];

  if (!sectorData || !product) return <div style={{padding:"40px",textAlign:"center"}}>Loading...</div>;

  const cost2026        = data[0].costDefault;
  const cost2030        = data[4].costDefault;
  const cost2034        = data[8].costDefault;
  const saving2034      = data[8].saving;
  const cumulativeSaving= data.reduce((s,d) => s + d.saving, 0);
  const indiaDefault    = product.worldDefault * product.indiaF;
  const actualVerified  = product.worldDefault * 0.87;
  const hasResult       = t > 0;

  return (
    <div style={{fontFamily:"'Georgia','Times New Roman',serif",background:"#050508",color:"#E8E6DE",minHeight:"100vh"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@300;400;500&display=swap');
        *{box-sizing:border-box;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input[type=range]{accent-color:#F59E0B;}
        .stab:hover{border-color:#F59E0B88!important;color:#E8E6DE!important;}
        .popt:hover{background:#1A1A24!important;}
        .ctab:hover{background:#D97706!important;transform:translateY(-1px);}
        .ifield:focus{outline:none;border-color:#F59E0B!important;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .rc{animation:fadeUp 0.4s ease forwards;}
      `}</style>

      {/* HEADER */}
      <div style={{padding:"20px 32px 18px",borderBottom:"1px solid #111120",background:"linear-gradient(180deg,#07070E 0%,#050508 100%)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:"10px",color:"#F59E0B",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"4px"}}>
            CBAM EXPOSURE CALCULATOR · EU Regulation 2023/956
          </div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"24px",color:"#FAFAF8",letterSpacing:"-0.5px"}}>
            India Export Carbon Cost
          </div>
        </div>
        <div style={{textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#374151",lineHeight:"1.8"}}>
          <div>DATA: EU Commission DVs 2026 · Reg. 2025/2620</div>
          <div>Phase-in: 2.5% (2026) → 100% (2034)</div>
          <div style={{color:"#F59E0B88"}}>Free · No registration required</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"400px 1fr",minHeight:"calc(100vh - 67px)"}}>

        {/* ── LEFT: INPUTS ── */}
        <div style={{borderRight:"1px solid #111120",padding:"24px",display:"flex",flexDirection:"column",gap:"22px",background:"#07070E",overflowY:"auto"}}>

          {/* Sector */}
          <div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#4B5563",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>01 / SECTOR</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px"}}>
              {Object.entries(PRODUCTS).map(([key,sec]) => (
                <button key={key} className="stab" onClick={() => { setSector(key); setProdId(PRODUCTS[key].items[0].id); }} style={{padding:"10px 6px",background:sector===key?sec.color+"18":"transparent",border:`1px solid ${sector===key?sec.color:"#1A1A24"}`,borderRadius:"3px",cursor:"pointer",color:sector===key?sec.color:"#4B5563",fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"1.5px",textTransform:"uppercase",transition:"all 0.15s",textAlign:"center"}}>
                  <div style={{fontSize:"14px",marginBottom:"3px"}}>{sec.icon}</div>
                  {sec.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#4B5563",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>02 / PRODUCT</div>
            <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
              {sectorData.items.map(p => (
                <div key={p.id} className="popt" onClick={() => setProdId(p.id)} style={{padding:"10px 12px",background:prodId===p.id?sectorData.color+"15":"#0D0D14",border:`1px solid ${prodId===p.id?sectorData.color+"60":"#111120"}`,borderRadius:"3px",cursor:"pointer",transition:"all 0.12s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:"12px",color:prodId===p.id?"#FAFAF8":"#9CA3AF",fontWeight:prodId===p.id?"600":"400"}}>{p.label}</div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#374151",marginTop:"2px"}}>CN {p.cn} · {p.route}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:"11px",color:sectorData.color}}>{(p.worldDefault*p.indiaF).toFixed(2)}</div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#374151"}}>tCO₂e/t</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volume */}
          <div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#4B5563",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>03 / ANNUAL EXPORT VOLUME TO EU</div>
            <div style={{position:"relative"}}>
              <input className="ifield" type="number" value={tonnage} onChange={e => setTonnage(e.target.value)} placeholder="e.g. 5000" style={{width:"100%",padding:"14px 54px 14px 16px",background:"#0D0D14",border:"1px solid #1A1A24",borderRadius:"3px",color:"#FAFAF8",fontFamily:"'DM Mono',monospace",fontSize:"20px",transition:"border-color 0.15s"}}/>
              <span style={{position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",fontFamily:"'DM Mono',monospace",fontSize:"11px",color:"#4B5563"}}>tonnes/yr</span>
            </div>
            <div style={{marginTop:"8px"}}>
              {[500,1000,5000,10000,50000].map(v => (
                <button key={v} onClick={() => setTonnage(String(v))} style={{marginRight:"6px",marginBottom:"4px",padding:"4px 10px",background:parseFloat(tonnage)===v?"#F59E0B22":"#0D0D14",border:`1px solid ${parseFloat(tonnage)===v?"#F59E0B":"#1A1A24"}`,borderRadius:"2px",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:"9px",color:parseFloat(tonnage)===v?"#F59E0B":"#4B5563",transition:"all 0.12s"}}>
                  {v>=1000?v/1000+"k":v}t
                </button>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#4B5563",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"12px"}}>04 / MARKET PARAMETERS</div>
            <div style={{marginBottom:"14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:"10px",color:"#6B7280"}}>EU ETS Carbon Price</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:"12px",color:"#FAFAF8"}}>€{euaPrice}/tCO₂e</span>
              </div>
              <input type="range" min="30" max="150" step="1" value={euaPrice} onChange={e => setEuaPrice(Number(e.target.value))} style={{width:"100%"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#374151",marginTop:"2px"}}>
                <span>€30 low</span><span>€65 current</span><span>€150 high</span>
              </div>
            </div>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:"10px",color:"#6B7280"}}>INR / EUR rate</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:"12px",color:"#FAFAF8"}}>₹{inrRate}/€</span>
              </div>
              <input type="range" min="80" max="110" step="1" value={inrRate} onChange={e => setInrRate(Number(e.target.value))} style={{width:"100%"}}/>
            </div>
          </div>

          {/* Emission data */}
          <div style={{background:"#0D0D14",border:"1px solid #111120",borderRadius:"3px",padding:"14px"}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#374151",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>EMISSION DATA</div>
            {([
              ["World avg default",        product.worldDefault.toFixed(2), "#6B7280"],
              ["India default (est.)",      indiaDefault.toFixed(2),         "#F59E0B"],
              ["Actual verified (est.)",    actualVerified.toFixed(2),        "#22C55E"],
              ["EU Benchmark BMg (Col B)",  product.bmgB.toFixed(3),         "#6366F1"],
            ] as [string,string,string][]).map(([lbl,val,col]) => (
              <div key={lbl} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #111120"}}>
                <span style={{fontSize:"11px",color:"#6B7280"}}>{lbl}</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:"12px",color:col,fontWeight:"600"}}>{val} tCO₂e/t</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: RESULTS ── */}
        <div style={{padding:"24px 28px",display:"flex",flexDirection:"column",gap:"20px",overflowY:"auto"}}>
          {!hasResult ? (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,textAlign:"center",padding:"60px 40px"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:"10px",color:"#374151",letterSpacing:"3px",marginBottom:"20px"}}>ENTER EXPORT VOLUME TO CALCULATE</div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"32px",color:"#1A1A24",lineHeight:"1.3",maxWidth:"360px"}}>How much will CBAM cost your EU exports?</div>
              <div style={{marginTop:"24px",fontFamily:"'DM Mono',monospace",fontSize:"11px",color:"#374151",lineHeight:"1.8"}}>
                <div>Based on EU Commission Regulation 2025/2620</div>
                <div>Actual benchmark values from official documents</div>
                <div>Phase-in trajectory 2026 → 2034</div>
              </div>
            </div>
          ) : (
            <>
              {/* KPI cards */}
              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#4B5563",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"12px"}}>ANNUAL CBAM EXPOSURE — INDIA DEFAULT VALUES</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px"}}>
                  {([
                    {label:"2026 (2.5%)",  val:cost2026, inrVal:cost2026*inrRate, tag:"First year",  color:"#F59E0B"},
                    {label:"2030 (48.5%)", val:cost2030, inrVal:cost2030*inrRate, tag:"Mid-point",   color:"#F97316"},
                    {label:"2034 (100%)",  val:cost2034, inrVal:cost2034*inrRate, tag:"Full CBAM",   color:"#EF4444"},
                  ] as {label:string;val:number;inrVal:number;tag:string;color:string}[]).map((c,i) => (
                    <div key={i} className="rc" style={{background:"#0D0D14",border:`1px solid ${c.color}40`,borderRadius:"4px",padding:"16px",animationDelay:`${i*0.1}s`}}>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:c.color,letterSpacing:"1.5px",marginBottom:"10px",textTransform:"uppercase"}}>{c.label}</div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:"20px",color:"#FAFAF8",fontWeight:"500",marginBottom:"4px"}}><AnimNum value={c.val} prefix="€"/></div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:"13px",color:c.color,marginBottom:"8px"}}><AnimNum value={c.inrVal} prefix="₹"/></div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#374151"}}>{c.tag}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Savings */}
              {saving2034 > 0 && (
                <div className="rc" style={{background:"linear-gradient(135deg,#0A1F0F,#0D1A10)",border:"1px solid #22C55E40",borderRadius:"4px",padding:"20px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"20px",animationDelay:"0.3s"}}>
                  <div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#22C55E",letterSpacing:"2px",marginBottom:"8px"}}>ANNUAL SAVING IN 2034</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:"22px",color:"#22C55E",fontWeight:"500"}}><AnimNum value={saving2034*inrRate/100000} prefix="₹" suffix=" lakh" decimals={1}/></div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:"11px",color:"#166534",marginTop:"4px"}}><AnimNum value={saving2034} prefix="€"/></div>
                  </div>
                  <div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#22C55E",letterSpacing:"2px",marginBottom:"8px"}}>8-YEAR CUMULATIVE SAVING</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:"22px",color:"#FAFAF8",fontWeight:"500"}}><AnimNum value={cumulativeSaving*inrRate/100000} prefix="₹" suffix=" lakh"/></div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:"11px",color:"#166534",marginTop:"4px"}}>2026–2034 total</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",justifyContent:"center"}}>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#166534",letterSpacing:"2px",marginBottom:"8px"}}>BY SWITCHING TO</div>
                    <div style={{fontSize:"12px",color:"#22C55E",lineHeight:"1.6"}}>Verified actual emissions vs India penalty default</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#374151",marginTop:"6px"}}>({indiaDefault.toFixed(2)} → {actualVerified.toFixed(2)} tCO₂e/t)</div>
                  </div>
                </div>
              )}

              {/* Chart */}
              <div style={{background:"#0D0D14",border:"1px solid #111120",borderRadius:"4px",padding:"20px"}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#4B5563",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"16px"}}>CBAM COST TRAJECTORY · 2026 → 2034</div>
                <TrajectoryChart data={data} inrRate={inrRate}/>
              </div>

              {/* Table */}
              <div style={{background:"#0D0D14",border:"1px solid #111120",borderRadius:"4px",overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:"11px"}}>
                  <thead>
                    <tr style={{background:"#111120"}}>
                      {["Year","Phase-in","Default (€)","Verified (€)","Annual saving (₹)"].map(h => (
                        <th key={h} style={{padding:"10px 14px",fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#4B5563",letterSpacing:"1.5px",textTransform:"uppercase",textAlign:"right",borderBottom:"1px solid #1A1A24",fontWeight:"400"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map(d => {
                      const key = d.year===2026||d.year===2030||d.year===2034;
                      return (
                        <tr key={d.year} style={{background:key?"#111820":"transparent",borderBottom:"1px solid #0F0F16"}}>
                          <td style={{padding:"10px 14px",fontFamily:"'DM Mono',monospace",fontSize:"12px",color:key?"#FAFAF8":"#6B7280",textAlign:"right",fontWeight:key?"700":"400"}}>{d.year}</td>
                          <td style={{padding:"10px 14px",fontFamily:"'DM Mono',monospace",fontSize:"11px",color:"#F59E0B",textAlign:"right"}}>{(d.factor*100).toFixed(1)}%</td>
                          <td style={{padding:"10px 14px",fontFamily:"'DM Mono',monospace",fontSize:"11px",color:"#EF4444",textAlign:"right"}}>€{Math.round(d.costDefault).toLocaleString("en-IN")}</td>
                          <td style={{padding:"10px 14px",fontFamily:"'DM Mono',monospace",fontSize:"11px",color:"#22C55E",textAlign:"right"}}>€{Math.round(d.costActual).toLocaleString("en-IN")}</td>
                          <td style={{padding:"10px 14px",fontFamily:"'DM Mono',monospace",fontSize:"11px",color:"#22C55E",textAlign:"right"}}>₹{Math.round(d.saving*inrRate).toLocaleString("en-IN")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Methodology */}
              <div style={{background:"#0A0A0F",border:"1px solid #1A1A24",borderRadius:"3px",padding:"14px 16px"}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#374151",letterSpacing:"2px",marginBottom:"8px"}}>METHODOLOGY</div>
                <div style={{fontSize:"11px",color:"#374151",lineHeight:"1.8"}}>
                  CBAM certificates = CBAMfactor × max(0, EmbeddedEmissions − CSCF × BMg_B) × Tonnage ·
                  CSCF = 0.87 · BMg_B from Reg. 2025/2620 Col B · India defaults = world avg × {product.indiaF}× (estimated) ·
                  <span style={{color:"#F59E0B"}}> Illustrative only. Engage a qualified CBAM advisor for official declarations.</span>
                </div>
              </div>

              {/* CTA */}
              {!submitted ? (
                <div style={{background:"linear-gradient(135deg,#0F0D00,#14100A)",border:"1px solid #F59E0B40",borderRadius:"4px",padding:"24px"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px",alignItems:"center"}}>
                    <div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#F59E0B",letterSpacing:"3px",marginBottom:"10px"}}>NEXT STEP</div>
                      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"20px",color:"#FAFAF8",lineHeight:"1.3",marginBottom:"10px"}}>
                        Get your facility&apos;s actual emission baseline
                      </div>
                      <div style={{fontSize:"12px",color:"#9CA3AF",lineHeight:"1.7"}}>
                        The saving shown above is achievable once your facility completes a verified emission baseline.
                        We work on-site with Indian manufacturers — completing the CBAM Communication Template,
                        supporting ISO 14064 verification, and defending your data with EU importers.
                      </div>
                    </div>
                    <div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#6B7280",marginBottom:"8px"}}>GET A FREE SCOPING ASSESSMENT</div>
                      <input className="ifield" type="email" placeholder="your.email@company.com" value={email} onChange={e => setEmail(e.target.value)}
                        style={{width:"100%",padding:"12px 14px",background:"#0D0D14",border:"1px solid #1A1A24",borderRadius:"3px",color:"#FAFAF8",fontFamily:"'DM Mono',monospace",fontSize:"13px",marginBottom:"10px",transition:"border-color 0.15s"}}/>
                      <button className="cta-b" onClick={async () => {
  if (!email) return;
  await supabase.from("leads").insert({
    email,
    sector,
    product_label: product.label,
    cn_code: product.cn,
    tonnage_per_year: t,
    eua_price: euaPrice,
    cost_2026_eur: cost2026,
    cost_2034_eur: cost2034,
    saving_2034_eur: saving2034,
    cumulative_saving_eur: cumulativeSaving,
  });
  setSubmitted(true);
}}
                        style={{width:"100%",padding:"13px",background:"#F59E0B",border:"none",borderRadius:"3px",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"#000",fontWeight:"700",transition:"all 0.15s"}}>
                        Request Free Scoping Call →
                      </button>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#374151",textAlign:"center",marginTop:"8px"}}>We respond within 24 hours · No sales pressure</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{background:"#0A1F0F",border:"1px solid #22C55E40",borderRadius:"4px",padding:"28px",textAlign:"center"}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#22C55E",letterSpacing:"3px",marginBottom:"12px"}}>RECEIVED</div>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"20px",color:"#FAFAF8"}}>We&apos;ll be in touch within 24 hours.</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:"11px",color:"#6B7280",marginTop:"10px"}}>Save this page — numbers update as you change the EUA price slider.</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
