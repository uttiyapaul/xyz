"use client";

interface YearRow {
  year: number;
  factor: number;
  costDefault: number;
  costActual: number;
  saving: number;
}

interface YearTableProps {
  data: YearRow[];
  inrRate: number;
}

const HEADERS = ["Year", "Phase-in", "Default (€)", "Verified (€)", "Annual saving (₹)"];

export function YearTable({ data, inrRate }: YearTableProps) {
  return (
    <div
      style={{
        background: "#0D0D14",
        border: "1px solid #111120",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
        <thead>
          <tr style={{ background: "#111120" }}>
            {HEADERS.map((h) => (
              <th
                key={h}
                style={{
                  padding: "10px 14px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "9px",
                  color: "#4B5563",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  textAlign: "right",
                  borderBottom: "1px solid #1A1A24",
                  fontWeight: "400",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d) => {
            const isKey = d.year === 2026 || d.year === 2030 || d.year === 2034;
            return (
              <tr
                key={d.year}
                style={{
                  background: isKey ? "#111820" : "transparent",
                  borderBottom: "1px solid #0F0F16",
                }}
              >
                <td
                  style={{
                    padding: "10px 14px",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "12px",
                    color: isKey ? "#FAFAF8" : "#6B7280",
                    textAlign: "right",
                    fontWeight: isKey ? "700" : "400",
                  }}
                >
                  {d.year}
                </td>
                <td
                  style={{
                    padding: "10px 14px",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "11px",
                    color: "#F59E0B",
                    textAlign: "right",
                  }}
                >
                  {(d.factor * 100).toFixed(1)}%
                </td>
                <td
                  style={{
                    padding: "10px 14px",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "11px",
                    color: "#EF4444",
                    textAlign: "right",
                  }}
                >
                  €{Math.round(d.costDefault).toLocaleString("en-IN")}
                </td>
                <td
                  style={{
                    padding: "10px 14px",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "11px",
                    color: "#22C55E",
                    textAlign: "right",
                  }}
                >
                  €{Math.round(d.costActual).toLocaleString("en-IN")}
                </td>
                <td
                  style={{
                    padding: "10px 14px",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "11px",
                    color: "#22C55E",
                    textAlign: "right",
                  }}
                >
                  ₹{Math.round(d.saving * inrRate).toLocaleString("en-IN")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
