import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SkeletonPageProps {
  title: string;
  description: string;
}

export function SkeletonPage({ title, description }: SkeletonPageProps) {
  return (
    <div style={{ padding: "32px", color: "#E8E6DE", fontFamily: "system-ui", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Header */}
      <div style={{ marginBottom: "32px", borderBottom: "1px solid #1A1A24", paddingBottom: "24px" }}>
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#9CA3AF", textDecoration: "none", fontSize: "14px", marginBottom: "24px", transition: "color 0.2s" }} className="hover:text-white">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#FAFAF8", margin: "0 0 12px 0" }}>{title}</h1>
        <p style={{ fontSize: "15px", color: "#9CA3AF", margin: 0, maxWidth: "600px", lineHeight: "1.5" }}>{description}</p>
      </div>

      {/* Content Skeleton */}
      <div style={{ background: "#0A0A0F", border: "1px solid #1A1A24", borderRadius: "12px", overflow: "hidden" }}>
        {/* Warning Banner */}
        <div style={{ background: "rgba(245, 158, 11, 0.05)", borderBottom: "1px solid rgba(245, 158, 11, 0.1)", padding: "16px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#F59E0B" }}>⚡</span>
          <span style={{ color: "#D97706", fontSize: "14px", fontWeight: "500" }}>Live Database Connection Pending</span>
        </div>

        {/* Mock UI Structure */}
        <div style={{ padding: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", animation: "pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)" }}>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ height: "36px", width: "200px", background: "#1A1A24", borderRadius: "6px" }}></div>
              <div style={{ height: "36px", width: "120px", background: "#1A1A24", borderRadius: "6px" }}></div>
            </div>
            <div style={{ height: "36px", width: "150px", background: "#1A1A24", borderRadius: "6px" }}></div>
          </div>

          <div style={{ border: "1px solid #1A1A24", borderRadius: "8px", animation: "pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)" }}>
            <div style={{ borderBottom: "1px solid #1A1A24", padding: "16px 24px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "16px" }}>
              <div style={{ height: "16px", background: "#27273A", borderRadius: "4px" }}></div>
              <div style={{ height: "16px", background: "#27273A", borderRadius: "4px" }}></div>
              <div style={{ height: "16px", background: "#27273A", borderRadius: "4px" }}></div>
              <div style={{ height: "16px", background: "#27273A", borderRadius: "4px" }}></div>
              <div style={{ height: "16px", background: "#27273A", borderRadius: "4px" }}></div>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ borderBottom: i !== 5 ? "1px solid #1A1A24" : "none", padding: "20px 24px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "16px" }}>
                <div style={{ height: "16px", width: "80%", background: "#1A1A24", borderRadius: "4px" }}></div>
                <div style={{ height: "16px", width: "40%", background: "#1A1A24", borderRadius: "4px" }}></div>
                <div style={{ height: "16px", width: "60%", background: "#1A1A24", borderRadius: "4px" }}></div>
                <div style={{ height: "16px", width: "50%", background: "#1A1A24", borderRadius: "4px" }}></div>
                <div style={{ height: "16px", width: "70%", background: "#1A1A24", borderRadius: "4px" }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }
      `}</style>
    </div>
  );
}
