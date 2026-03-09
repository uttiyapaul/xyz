"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface EmissionSource {
  id: string;
  source_name: string;
  scope: string;
}

interface ActivityRecord {
  id: string;
  quantity: number;
  unit: string;
  activity_date: string;
  description: string;
  source_name: string;
}

export default function ActivityDataPage() {
  const [sources, setSources] = useState<EmissionSource[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [form, setForm] = useState({
    source_id: "",
    quantity: "",
    unit: "kWh",
    activity_date: new Date().toISOString().split("T")[0],
    description: ""
  });
  const [orgId, setOrgId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
    if (orgs && orgs[0]) {
      const oid = orgs[0].id;
      setOrgId(oid);
      
      const { data: srcData } = await supabase.from("emission_sources").select("*").eq("organization_id", oid);
      if (srcData) setSources(srcData);

      const { data: actData } = await supabase
        .from("activity_data")
        .select("*, emission_sources(source_name)")
        .eq("organization_id", oid)
        .order("activity_date", { ascending: false })
        .limit(20);
      if (actData) {
        setActivities(actData.map(a => ({
          id: a.id,
          quantity: a.quantity,
          unit: a.unit,
          activity_date: a.activity_date,
          description: a.description,
          source_name: a.emission_sources?.source_name || "N/A"
        })));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !form.source_id || !form.quantity) return;

    await supabase.from("activity_data").insert({
      organization_id: orgId,
      source_id: form.source_id,
      quantity: parseFloat(form.quantity),
      unit: form.unit,
      activity_date: form.activity_date,
      description: form.description
    });

    setForm({ source_id: "", quantity: "", unit: "kWh", activity_date: new Date().toISOString().split("T")[0], description: "" });
    loadData();
  }

  return (
    <div style={{ fontFamily: "system-ui", background: "#050508", color: "#E8E6DE", minHeight: "100vh" }}>
      <div style={{ padding: "20px 32px", borderBottom: "1px solid #111120", background: "#07070E" }}>
        <h1 style={{ fontSize: "24px", color: "#FAFAF8", margin: 0 }}>Activity Data Entry</h1>
      </div>

      <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "400px 1fr", gap: "24px" }}>
        <div>
          <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "20px" }}>
            <h2 style={{ fontSize: "16px", color: "#FAFAF8", marginBottom: "16px" }}>New Activity</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>SOURCE</label>
                <select value={form.source_id} onChange={e => setForm({ ...form, source_id: e.target.value })} style={{ width: "100%", padding: "10px", background: "#07070E", border: "1px solid #1A1A24", borderRadius: "4px", color: "#FAFAF8", fontSize: "14px" }} required>
                  <option value="">Select...</option>
                  {sources.map(s => (
                    <option key={s.id} value={s.id}>{s.source_name} ({s.scope})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>QUANTITY</label>
                <input type="number" step="0.01" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} style={{ width: "100%", padding: "10px", background: "#07070E", border: "1px solid #1A1A24", borderRadius: "4px", color: "#FAFAF8", fontSize: "14px" }} required />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>UNIT</label>
                <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={{ width: "100%", padding: "10px", background: "#07070E", border: "1px solid #1A1A24", borderRadius: "4px", color: "#FAFAF8", fontSize: "14px" }}>
                  <option value="kWh">kWh</option>
                  <option value="L">Liters</option>
                  <option value="m3">m³</option>
                  <option value="kg">kg</option>
                  <option value="tonnes">tonnes</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>DATE</label>
                <input type="date" value={form.activity_date} onChange={e => setForm({ ...form, activity_date: e.target.value })} style={{ width: "100%", padding: "10px", background: "#07070E", border: "1px solid #1A1A24", borderRadius: "4px", color: "#FAFAF8", fontSize: "14px" }} required />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>DESCRIPTION</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: "100%", padding: "10px", background: "#07070E", border: "1px solid #1A1A24", borderRadius: "4px", color: "#FAFAF8", fontSize: "14px", minHeight: "80px" }} />
              </div>

              <button type="submit" style={{ width: "100%", padding: "12px", background: "#F59E0B", border: "none", borderRadius: "4px", color: "#000", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                Add Activity
              </button>
            </form>
          </div>
        </div>

        <div>
          <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #1A1A24" }}>
              <h2 style={{ fontSize: "16px", color: "#FAFAF8", margin: 0 }}>Recent Activities</h2>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#07070E" }}>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "11px", color: "#6B7280", fontWeight: "500" }}>DATE</th>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "11px", color: "#6B7280", fontWeight: "500" }}>SOURCE</th>
                  <th style={{ padding: "12px 20px", textAlign: "right", fontSize: "11px", color: "#6B7280", fontWeight: "500" }}>QUANTITY</th>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "11px", color: "#6B7280", fontWeight: "500" }}>DESCRIPTION</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(a => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #111120" }}>
                    <td style={{ padding: "12px 20px", fontSize: "13px", color: "#9CA3AF" }}>{a.activity_date}</td>
                    <td style={{ padding: "12px 20px", fontSize: "13px", color: "#FAFAF8" }}>{a.source_name}</td>
                    <td style={{ padding: "12px 20px", fontSize: "13px", color: "#F59E0B", textAlign: "right" }}>
                      {a.quantity.toLocaleString()} {a.unit}
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: "13px", color: "#6B7280" }}>{a.description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
