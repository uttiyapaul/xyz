"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Site {
  id: string;
  name: string;
  city: string;
}

interface EmissionSource {
  id: string;
  source_name: string;
  scope: string;
  category: string;
  site_name: string;
}

export default function SourcesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [sources, setSources] = useState<EmissionSource[]>([]);
  const [form, setForm] = useState({
    source_name: "",
    scope: "Scope 1",
    category: "",
    site_id: ""
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

      const { data: siteData } = await supabase.from("sites").select("*").eq("organization_id", oid);
      if (siteData) setSites(siteData);

      const { data: srcData } = await supabase
        .from("emission_sources")
        .select("*, sites(name)")
        .eq("organization_id", oid);
      if (srcData) {
        setSources(srcData.map(s => ({
          id: s.id,
          source_name: s.source_name,
          scope: s.scope,
          category: s.category,
          site_name: s.sites?.name || "N/A"
        })));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !form.source_name) return;

    await supabase.from("emission_sources").insert({
      organization_id: orgId,
      source_name: form.source_name,
      scope: form.scope,
      category: form.category,
      site_id: form.site_id || null
    });

    setForm({ source_name: "", scope: "Scope 1", category: "", site_id: "" });
    loadData();
  }

  return (
    <div style={{ fontFamily: "system-ui", background: "#050508", color: "#E8E6DE", minHeight: "100vh" }}>
      <div style={{ padding: "20px 32px", borderBottom: "1px solid #111120", background: "#07070E" }}>
        <h1 style={{ fontSize: "24px", color: "#FAFAF8", margin: 0 }}>Emission Sources</h1>
      </div>

      <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "400px 1fr", gap: "24px" }}>
        <div>
          <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "20px" }}>
            <h2 style={{ fontSize: "16px", color: "#FAFAF8", marginBottom: "16px" }}>New Source</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>SOURCE NAME</label>
                <input type="text" value={form.source_name} onChange={e => setForm({ ...form, source_name: e.target.value })} placeholder="e.g. Natural Gas Boiler" style={{ width: "100%", padding: "10px", background: "#07070E", border: "1px solid #1A1A24", borderRadius: "4px", color: "#FAFAF8", fontSize: "14px" }} required />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>SCOPE</label>
                <select value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} style={{ width: "100%", padding: "10px", background: "#07070E", border: "1px solid #1A1A24", borderRadius: "4px", color: "#FAFAF8", fontSize: "14px" }}>
                  <option value="Scope 1">Scope 1 - Direct</option>
                  <option value="Scope 2">Scope 2 - Electricity</option>
                  <option value="Scope 3">Scope 3 - Indirect</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>CATEGORY</label>
                <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Stationary Combustion" style={{ width: "100%", padding: "10px", background: "#07070E", border: "1px solid #1A1A24", borderRadius: "4px", color: "#FAFAF8", fontSize: "14px" }} />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>SITE (OPTIONAL)</label>
                <select value={form.site_id} onChange={e => setForm({ ...form, site_id: e.target.value })} style={{ width: "100%", padding: "10px", background: "#07070E", border: "1px solid #1A1A24", borderRadius: "4px", color: "#FAFAF8", fontSize: "14px" }}>
                  <option value="">None</option>
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.city}</option>
                  ))}
                </select>
              </div>

              <button type="submit" style={{ width: "100%", padding: "12px", background: "#F59E0B", border: "none", borderRadius: "4px", color: "#000", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                Add Source
              </button>
            </form>
          </div>
        </div>

        <div>
          <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #1A1A24" }}>
              <h2 style={{ fontSize: "16px", color: "#FAFAF8", margin: 0 }}>All Sources</h2>
            </div>
            <div style={{ padding: "20px" }}>
              {["Scope 1", "Scope 2", "Scope 3"].map(scope => {
                const scopeSources = sources.filter(s => s.scope === scope);
                if (scopeSources.length === 0) return null;
                return (
                  <div key={scope} style={{ marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "14px", color: scope === "Scope 1" ? "#EF4444" : scope === "Scope 2" ? "#F59E0B" : "#06B6D4", marginBottom: "12px" }}>{scope}</h3>
                    <div style={{ display: "grid", gap: "8px" }}>
                      {scopeSources.map(s => (
                        <div key={s.id} style={{ background: "#07070E", border: "1px solid #1A1A24", borderRadius: "4px", padding: "12px" }}>
                          <div style={{ fontSize: "14px", color: "#FAFAF8", marginBottom: "4px" }}>{s.source_name}</div>
                          <div style={{ fontSize: "11px", color: "#6B7280" }}>
                            {s.category && <span>{s.category} · </span>}
                            <span>Site: {s.site_name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
