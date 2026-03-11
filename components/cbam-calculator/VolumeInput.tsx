"use client";

const QUICK_PICKS = [500, 1000, 5000, 10000, 50000];

interface VolumeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function VolumeInput({ value, onChange }: VolumeInputProps) {
  return (
    <div>
      <div
        style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: "9px",
          color: "#4B5563",
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}
      >
        03 / ANNUAL EXPORT VOLUME TO EU
      </div>

      <div style={{ position: "relative" }}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. 5000"
          style={{
            width: "100%",
            padding: "14px 54px 14px 16px",
            background: "#0D0D14",
            border: "1px solid #1A1A24",
            borderRadius: "3px",
            color: "#FAFAF8",
            fontFamily: "'DM Mono',monospace",
            fontSize: "20px",
            transition: "border-color 0.15s",
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#F59E0B")}
          onBlur={(e)  => (e.currentTarget.style.borderColor = "#1A1A24")}
        />
        <span
          style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "'DM Mono',monospace",
            fontSize: "11px",
            color: "#4B5563",
            pointerEvents: "none",
          }}
        >
          tonnes/yr
        </span>
      </div>

      <div style={{ marginTop: "8px" }}>
        {QUICK_PICKS.map((v) => (
          <button
            key={v}
            onClick={() => onChange(String(v))}
            style={{
              marginRight: "6px",
              marginBottom: "4px",
              padding: "4px 10px",
              background: parseFloat(value) === v ? "#F59E0B22" : "#0D0D14",
              border: `1px solid ${parseFloat(value) === v ? "#F59E0B" : "#1A1A24"}`,
              borderRadius: "2px",
              cursor: "pointer",
              fontFamily: "'DM Mono',monospace",
              fontSize: "9px",
              color: parseFloat(value) === v ? "#F59E0B" : "#4B5563",
              transition: "all 0.12s",
            }}
          >
            {v >= 1000 ? v / 1000 + "k" : v}t
          </button>
        ))}
      </div>
    </div>
  );
}
