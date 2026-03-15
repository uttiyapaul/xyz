"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface LeadCaptureFormProps {
  sector: string;
  productLabel: string;
  cnCode: string;
  tonnage: number;
  euaPrice: number;
  cost2026: number;
  cost2034: number;
  saving2034: number;
  cumulativeSaving: number;
}

export function LeadCaptureForm({
  sector,
  productLabel,
  cnCode,
  tonnage,
  euaPrice,
  cost2026,
  cost2034,
  saving2034,
  cumulativeSaving,
}: LeadCaptureFormProps) {
  const [email,     setEmail]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    await supabase.from("leads").insert({
      email,
      sector,
      product_label:        productLabel,
      cn_code:              cnCode,
      tonnage_per_year:     tonnage,
      eua_price:            euaPrice,
      cost_2026_eur:        cost2026,
      cost_2034_eur:        cost2034,
      saving_2034_eur:      saving2034,
      cumulative_saving_eur: cumulativeSaving,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        style={{
          background: "#0A1F0F",
          border: "1px solid #22C55E40",
          borderRadius: "4px",
          padding: "28px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px",
            color: "#22C55E",
            letterSpacing: "3px",
            marginBottom: "12px",
            textTransform: "uppercase",
          }}
        >
          RECEIVED
        </div>
        <div
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "20px",
            color: "#FAFAF8",
          }}
        >
          We&apos;ll be in touch within 24 hours.
        </div>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "11px",
            color: "#6B7280",
            marginTop: "10px",
          }}
        >
          Save this page — numbers update as you change the EUA price slider.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg,#0F0D00,#14100A)",
        border: "1px solid #F59E0B40",
        borderRadius: "4px",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          alignItems: "center",
        }}
      >
        {/* Left copy */}
        <div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "9px",
              color: "#F59E0B",
              letterSpacing: "3px",
              marginBottom: "10px",
              textTransform: "uppercase",
            }}
          >
            NEXT STEP
          </div>
          <div
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "20px",
              color: "#FAFAF8",
              lineHeight: "1.3",
              marginBottom: "10px",
            }}
          >
            Get your facility&apos;s actual emission baseline
          </div>
          <div style={{ fontSize: "12px", color: "#9CA3AF", lineHeight: "1.7" }}>
            The saving shown above is achievable once your facility completes a verified
            emission baseline. We work on-site with Indian manufacturers — completing the
            CBAM Communication Template, supporting ISO 14064 verification, and defending
            your data with EU importers.
          </div>
        </div>

        {/* Right form */}
        <div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "9px",
              color: "#6B7280",
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            GET A FREE SCOPING ASSESSMENT
          </div>

          <input
            type="email"
            placeholder="your.email@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "#0D0D14",
              border: "1px solid #1A1A24",
              borderRadius: "3px",
              color: "#FAFAF8",
              fontFamily: "'DM Mono', monospace",
              fontSize: "13px",
              marginBottom: "10px",
              transition: "border-color 0.15s",
              outline: "none",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#F59E0B")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "#1A1A24")}
          />

          <button
            onClick={handleSubmit}
            style={{
              width: "100%",
              padding: "13px",
              background: "#F59E0B",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#000",
              fontWeight: "700",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#D97706";
              e.currentTarget.style.transform  = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#F59E0B";
              e.currentTarget.style.transform  = "translateY(0)";
            }}
          >
            Request Free Scoping Call →
          </button>

          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "9px",
              color: "#374151",
              textAlign: "center",
              marginTop: "8px",
            }}
          >
            We respond within 24 hours · No sales pressure
          </div>
        </div>
      </div>
    </div>
  );
}
