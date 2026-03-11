"use client";

interface MarketParametersProps {
  euaPrice: number;
  inrRate: number;
  onEuaChange: (v: number) => void;
  onInrChange: (v: number) => void;
}

export function MarketParameters({
  euaPrice,
  inrRate,
  onEuaChange,
  onInrChange,
}: MarketParametersProps) {
  const labelStyle = {
    fontFamily: "'DM Mono',monospace",
    fontSize: "10px",
    color: "#6B7280",
  };
  const valueStyle = {
    fontFamily: "'DM Mono',monospace",
    fontSize: "12px",
    color: "#FAFAF8",
  };
  const rangeHintStyle = {
    display: "flex",
    justifyContent: "space-between" as const,
    fontFamily: "'DM Mono',monospace",
    fontSize: "9px",
    color: "#374151",
    marginTop: "2px",
  };

  return (
    <div>
      <div
        style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: "9px",
          color: "#4B5563",
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        04 / MARKET PARAMETERS
      </div>

      {/* EUA Price */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={labelStyle}>EU ETS Carbon Price</span>
          <span style={valueStyle}>€{euaPrice}/tCO₂e</span>
        </div>
        <input
          type="range"
          min={30}
          max={150}
          step={1}
          value={euaPrice}
          onChange={(e) => onEuaChange(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#F59E0B" }}
        />
        <div style={rangeHintStyle}>
          <span>€30 low</span>
          <span>€65 current</span>
          <span>€150 high</span>
        </div>
      </div>

      {/* INR Rate */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={labelStyle}>INR / EUR rate</span>
          <span style={valueStyle}>₹{inrRate}/€</span>
        </div>
        <input
          type="range"
          min={80}
          max={110}
          step={1}
          value={inrRate}
          onChange={(e) => onInrChange(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#F59E0B" }}
        />
        <div style={rangeHintStyle}>
          <span>₹80</span>
          <span>₹{inrRate}</span>
          <span>₹110</span>
        </div>
      </div>
    </div>
  );
}
