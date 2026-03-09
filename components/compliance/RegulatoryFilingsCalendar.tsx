"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";

// Status values from regulatory_filings.status CHECK constraint in your schema
type FilingStatus =
  | "not_started" | "in_progress" | "under_review"
  | "submitted" | "accepted" | "rejected" | "waived";

const STATUS_STYLES: Record<FilingStatus, string> = {
  not_started:  "bg-gray-100 text-gray-600",
  in_progress:  "bg-blue-100 text-blue-700",
  under_review: "bg-yellow-100 text-yellow-700",
  submitted:    "bg-green-100 text-green-700",
  accepted:     "bg-green-200 text-green-800 font-medium",
  rejected:     "bg-red-100 text-red-700",
  waived:       "bg-purple-100 text-purple-700",
};

interface Props {
  orgId: string;
  fyYear: string;
}

export function RegulatoryFilingsCalendar({ orgId, fyYear }: Props) {
  const [filings, setFilings] = useState<any[]>([]);

  useEffect(() => {
    loadFilings();
  }, [orgId, fyYear]);

  async function loadFilings() {
    const { data } = await supabase
      .from("regulatory_filings")
      .select(`
        *,
        disclosure_frameworks ( framework_name, full_name, governing_body, framework_type )
      `)
      .eq("organization_id", orgId)
      .eq("fy_year", fyYear)
      .order("due_date");
    setFilings(data ?? []);
  }

  async function updateStatus(id: string, status: FilingStatus) {
    await supabase
      .from("regulatory_filings")
      .update({
        status,
        submitted_at: status === "submitted" ? new Date().toISOString() : undefined,
        accepted_at:  status === "accepted"  ? new Date().toISOString() : undefined,
      })
      .eq("id", id);
    loadFilings();
  }

  const today = new Date();
  const completedStatuses: FilingStatus[] = ["submitted", "accepted", "waived"];

  const overdue = filings.filter(
    (f) => new Date(f.due_date) < today && !completedStatuses.includes(f.status)
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Regulatory Filings — {fyYear}</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Tracks BRSR, CDP, CSRD, CBAM, GRI, TCFD, SBTi and other framework deadlines
        </p>
      </div>

      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-center gap-2">
          <span className="text-red-600 font-bold text-lg">⚠</span>
          <p className="text-red-700 font-medium text-sm">
            {overdue.length} filing{overdue.length > 1 ? "s" : ""} overdue —{" "}
            {overdue.map((f) => f.disclosure_frameworks?.framework_name).join(", ")}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {filings.map((f) => {
          const dueDate = new Date(f.due_date);
          const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
          const isOverdue = daysLeft < 0 && !completedStatuses.includes(f.status);
          const isUrgent  = daysLeft >= 0 && daysLeft <= 30 && !completedStatuses.includes(f.status);

          return (
            <div
              key={f.id}
              className={`border rounded-lg p-4 ${
                isOverdue ? "border-red-300 bg-red-50"
                : isUrgent ? "border-amber-300 bg-amber-50"
                : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">
                      {f.disclosure_frameworks?.framework_name}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {f.disclosure_frameworks?.governing_body}
                    </span>
                    <span className="text-xs text-gray-400">
                      {f.disclosure_frameworks?.framework_type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    {f.disclosure_frameworks?.full_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-3 flex-wrap">
                    <span>Due: <strong>{dueDate.toLocaleDateString("en-IN")}</strong></span>
                    {isOverdue && (
                      <span className="text-red-600 font-semibold">
                        {Math.abs(daysLeft)} days overdue
                      </span>
                    )}
                    {isUrgent && (
                      <span className="text-amber-700 font-medium">
                        {daysLeft} days left
                      </span>
                    )}
                    {f.responsible_person && (
                      <span>Owner: {f.responsible_person}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLES[f.status as FilingStatus]}`}>
                    {f.status.replace(/_/g, " ")}
                  </span>
                  <select
                    value={f.status}
                    onChange={(e) => updateStatus(f.id, e.target.value as FilingStatus)}
                    className="text-xs border rounded px-2 py-1"
                  >
                    {Object.keys(STATUS_STYLES).map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
        {filings.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No filings configured for {fyYear}.
          </div>
        )}
      </div>
    </div>
  );
}