"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { usePermission } from "../../lib/hooks/usePermission";

interface Props {
  orgId: string;
  industrySegmentId: string;
  fyYear: string;
}

export function BenchmarkPanel({ orgId, industrySegmentId, fyYear }: Props) {
  const { hasPermission, isLoading } = usePermission("benchmarks:view", orgId);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);

  useEffect(() => {
    if (!hasPermission) return;
    supabase
      .from("industry_benchmarks")
      .select("*")
      .eq("industry_segment_id", industrySegmentId)
      .eq("fy_year", fyYear)
      .then(({ data }) => setBenchmarks(data ?? []));
  }, [hasPermission, industrySegmentId, fyYear]);

  if (isLoading) return null;

  if (!hasPermission) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500 text-sm">
          Upgrade to Professional to access industry benchmarks
        </p>
      </div>
    );
  }

  if (benchmarks.length === 0) {
    return (
      <div className="border rounded-lg p-4 text-center text-sm text-gray-400">
        No benchmark data available for this industry and year
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Industry Benchmarks — {fyYear}</h3>
      <p className="text-xs text-gray-500">
        Based on {benchmarks[0]?.data_source ?? "industry survey data"}
      </p>
      <div className="space-y-4">
        {benchmarks.map((bm) => (
          <div key={bm.id} className="border rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium capitalize">
                {bm.metric_type.replace(/_/g, " ")}
              </div>
              <div className="text-xs text-gray-400">Scope {bm.scope}</div>
            </div>
            {/* Quartile bar */}
            <div className="relative h-5 bg-gray-100 rounded overflow-hidden flex">
              <div className="h-full bg-green-300" style={{ width: "25%" }} title={`Top 25%: ≤${bm.benchmark_p25}`} />
              <div className="h-full bg-yellow-200" style={{ width: "25%" }} title={`Median: ${bm.benchmark_p50}`} />
              <div className="h-full bg-orange-200" style={{ width: "25%" }} title={`P75: ${bm.benchmark_p75}`} />
              <div className="h-full bg-red-200"    style={{ width: "25%" }} title={`P90: ${bm.benchmark_p90}`} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Leaders ≤{bm.benchmark_p25}</span>
              <span>Median {bm.benchmark_p50}</span>
              <span>Laggards ≥{bm.benchmark_p75}</span>
            </div>
            {bm.sample_size && (
              <div className="text-xs text-gray-400 mt-1">n={bm.sample_size} companies</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}