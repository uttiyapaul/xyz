"use client";

import { useEffect, useState } from "react";
import { getTargetsProgress } from "../../lib/supabase/queries";

interface Props {
  orgId: string;
}

export function SBTiMilestoneTracker({ orgId }: Props) {
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    getTargetsProgress(orgId).then(({ data }) =>
      setProgress(data?.filter((p: any) => p.is_sbti_aligned) ?? [])
    );
  }, [orgId]);

  if (progress.length === 0) {
    return (
      <div className="border rounded-lg p-4 text-center text-sm text-gray-400">
        No SBTi-aligned targets configured yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Science-Based Targets Progress</h2>
      {progress.map((p) => {
        const pctAchieved = Number(p.achieved_reduction_pct ?? 0);
        const pctTarget   = Number(p.reduction_pct ?? 0);
        const barFill     = pctTarget > 0
          ? Math.min((pctAchieved / pctTarget) * 100, 100)
          : 0;

        return (
          <div key={p.target_id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{p.target_name}</div>
                <div className="text-sm text-gray-500">
                  Base: {p.base_year} → Target: {p.target_year} · {pctTarget}% reduction
                  {p.is_net_zero && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                      Net Zero
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  p.is_on_track
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {p.is_on_track ? "✓ On Track" : "⚠ Off Track"}
              </span>
            </div>

            {/* Key numbers */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Base Year",              value: p.base_tco2e,     color: "text-gray-700" },
                { label: "Current",                value: p.current_tco2e,   color: p.is_on_track ? "text-green-600" : "text-red-600" },
                { label: `Target (${p.target_year})`, value: p.target_tco2e, color: "text-blue-600" },
              ].map((c) => (
                <div key={c.label} className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-500">{c.label}</div>
                  <div className={`text-lg font-bold ${c.color}`}>
                    {c.value != null ? Number(c.value).toFixed(1) : "—"} tCO₂e
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>
                  Achieved: {pctAchieved.toFixed(1)}% of {pctTarget}% target
                </span>
                <span>{barFill.toFixed(0)}% complete</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    p.is_on_track ? "bg-green-500" : "bg-red-400"
                  }`}
                  style={{ width: `${barFill}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}