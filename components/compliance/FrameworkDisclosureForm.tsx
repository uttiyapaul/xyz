"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { useAuth } from "../../context/AuthContext";

interface Props {
  orgId: string;
  frameworkId: string; // e.g. "GRI", "BRSR", "TCFD", "SBTI"
  fyYear: string;
}

export function FrameworkDisclosureForm({ orgId, frameworkId, fyYear }: Props) {
  const { user } = useAuth();
  const [indicators, setIndicators] = useState<any[]>([]);
  const [disclosures, setDisclosures] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadIndicators();
    loadDisclosures();
  }, [orgId, frameworkId, fyYear]);

  async function loadIndicators() {
    const { data } = await supabase
      .from("framework_indicators")
      .select("*")
      .eq("framework_id", frameworkId)
      .order("indicator_code");
    setIndicators(data ?? []);
  }

  async function loadDisclosures() {
    const { data } = await supabase
      .from("framework_disclosures")
      .select("*")
      .eq("organization_id", orgId)
      .eq("framework_id", frameworkId)
      .eq("fy_year", fyYear);

    const map: Record<string, any> = {};
    data?.forEach((d) => { map[d.indicator_id] = d; });
    setDisclosures(map);
  }

  async function saveDisclosure(
    indicatorId: string,
    value: number | string | null,
    unit?: string
  ) {
    if (!user) return;
    setSaving((s) => ({ ...s, [indicatorId]: true }));

    const existing = disclosures[indicatorId];
    const payload = {
      organization_id: orgId,
      framework_id: frameworkId,
      indicator_id: indicatorId,
      fy_year: fyYear,
      value_numeric: typeof value === "number" ? value : null,
      value_text: typeof value === "string" && value !== "" ? value : null,
      value_unit: unit ?? null,
      status: "draft",
      submitted_by: user.id,
    };

    if (existing?.id) {
      await supabase.from("framework_disclosures").update(payload).eq("id", existing.id);
    } else {
      const { data } = await supabase.from("framework_disclosures").insert(payload).select().single();
      if (data) setDisclosures((d) => ({ ...d, [indicatorId]: data }));
    }

    setSaving((s) => ({ ...s, [indicatorId]: false }));
    loadDisclosures();
  }

  const completed = indicators.filter((i) => disclosures[i.id]?.value_numeric !== null || disclosures[i.id]?.value_text).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{frameworkId} Disclosures — {fyYear}</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {completed} of {indicators.length} indicators completed
        </p>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${indicators.length > 0 ? (completed / indicators.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {indicators.map((ind) => {
          const disc = disclosures[ind.id];
          const isSaving = saving[ind.id];

          return (
            <div key={ind.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {ind.indicator_code}
                    </span>
                    {ind.is_mandatory && (
                      <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">
                        Required
                      </span>
                    )}
                    {ind.ghg_scope?.length > 0 && (
                      <span className="text-xs text-gray-400">
                        Scope {(ind.ghg_scope as number[]).join("+")}
                      </span>
                    )}
                  </div>
                  <div className="font-medium text-sm mt-1">{ind.indicator_name}</div>
                  {ind.indicator_desc && (
                    <div className="text-xs text-gray-500 mt-0.5">{ind.indicator_desc}</div>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded shrink-0 ml-2 ${
                  disc ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {isSaving ? "Saving…" : disc ? "✓ " + disc.status : "Not entered"}
                </span>
              </div>

              {ind.data_type === "quantitative" ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder={`Value in ${ind.unit ?? "units"}`}
                    defaultValue={disc?.value_numeric ?? ""}
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) saveDisclosure(ind.id, val, ind.unit);
                    }}
                    className="border rounded px-3 py-1.5 text-sm w-48"
                  />
                  {ind.unit && (
                    <span className="text-xs text-gray-500">{ind.unit}</span>
                  )}
                </div>
              ) : (
                <textarea
                  rows={3}
                  placeholder="Enter narrative disclosure..."
                  defaultValue={disc?.value_text ?? ""}
                  onBlur={(e) => {
                    if (e.target.value.trim()) saveDisclosure(ind.id, e.target.value.trim());
                  }}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}