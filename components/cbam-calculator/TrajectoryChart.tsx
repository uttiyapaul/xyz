"use client";

interface YearRow {
  year: number;
  costDefault: number;
  costActual: number;
  saving: number;
}

interface TrajectoryChartProps {
  data: YearRow[];
  inrRate: number;
}

export function TrajectoryChart({ data, inrRate }: TrajectoryChartProps) {
  const maxCost = Math.max(...data.map((d) => d.costDefault));

  if (maxCost === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "#4B5563",
          padding: "40px 0",
          fontFamily: "monospace",
          fontSize: "12px",
        }}
      >
        Enter export volume to see projection
      </div>
    );
  }

  return (
    <div style={{ padding: "4px 0" }}>
      {/* Legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "20px",
            fontSize: "10px",
            fontFamily: "monospace",
          }}
        >
          <span style={{ color: "#F59E0B" }}>▬ India default values</span>
          <span style={{ color: "#22C55E" }}>▬ Verified actual emissions</span>
        </div>
      </div>

      {/* Rows */}
      {data.map((d) => {
        const wD = (d.costDefault / maxCost) * 100;
        const wA = (d.costActual  / maxCost) * 100;
        const isKey = d.year === 2026 || d.year === 2030 || d.year === 2034;

        return (
          <div
            key={d.year}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "6px",
            }}
          >
            {/* Year label */}
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px",
                width: "36px",
                flexShrink: 0,
                color: isKey ? "#FAFAF8" : "#6B7280",
                fontWeight: isKey ? "700" : "400",
              }}
            >
              {d.year}
            </span>

            {/* Bar track */}
            <div style={{ flex: 1, position: "relative", height: "24px" }}>
              {/* Default bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "24px",
                  width: `${wD}%`,
                  background: isKey ? "#F59E0B" : "#F59E0B55",
                  borderRadius: "2px",
                  transition: "width 0.6s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: "6px",
                }}
              >
                {wD > 25 && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: "'DM Mono', monospace",
                      color: "#000",
                      fontWeight: "700",
                    }}
                  >
                    €{Math.round(d.costDefault).toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Actual/verified bar overlay */}
              <div
                style={{
                  position: "absolute",
                  top: "6px",
                  left: 0,
                  height: "12px",
                  width: `${wA}%`,
                  background: "#22C55E",
                  borderRadius: "1px",
                  opacity: 0.85,
                  transition: "width 0.6s ease 0.1s",
                }}
              />
            </div>

            {/* Saving label */}
            {d.saving > 0 && (
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "10px",
                  color: "#22C55E",
                  width: "90px",
                  flexShrink: 0,
                  textAlign: "right",
                }}
              >
                save ₹
                {Math.round((d.saving * inrRate) / 100000).toLocaleString("en-IN")}L
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
