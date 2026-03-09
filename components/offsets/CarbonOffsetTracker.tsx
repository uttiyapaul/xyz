"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { useAuth } from "../../context/AuthContext";

// Matches public.carbon_offsets + public.carbon_offset_registries from your schema
interface Offset {
  id: string;
  registry_id: string;
  serial_number: string;
  project_name: string;
  project_type: string;
  vintage_year: number;
  quantity_tco2e: number;
  purchase_date: string;
  is_retired: boolean;
  retirement_date: string | null;
  retirement_purpose: string | null;
  carbon_offset_registries: { name: string } | null;
}

interface Props {
  orgId: string;
  fyYear: string;
}

// Matches carbon_offsets.project_type CHECK constraint
const PROJECT_TYPES = [
  "renewable_energy", "forestry", "cookstoves", "methane_capture",
  "energy_efficiency", "blue_carbon", "dac", "other",
];

export function CarbonOffsetTracker({ orgId, fyYear }: Props) {
  const { user } = useAuth();
  const [offsets, setOffsets] = useState<Offset[]>([]);
  const [registries, setRegistries] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    registry_id: "",
    serial_number: "",
    project_name: "",
    project_type: "renewable_energy",
    vintage_year: new Date().getFullYear(),
    quantity_tco2e: "",
    purchase_date: "",
    scope_offset: 1,
    retirement_purpose: "voluntary_offset",
  });

  useEffect(() => {
    loadRegistries();
    loadOffsets();
  }, [orgId, fyYear]);

  async function loadRegistries() {
    const { data } = await supabase.from("carbon_offset_registries").select("id, name");
    setRegistries(data ?? []);
  }

  async function loadOffsets() {
    const { data } = await supabase
      .from("carbon_offsets")
      .select("*, carbon_offset_registries(name)")
      .eq("organization_id", orgId)
      .eq("fy_year_applied", fyYear)
      .order("purchase_date", { ascending: false });
    setOffsets(data ?? []);
  }

  async function addOffset() {
    if (!user || !form.registry_id || !form.project_name || !form.quantity_tco2e) return;

    const { error } = await supabase.from("carbon_offsets").insert({
      organization_id: orgId,
      registry_id: form.registry_id,
      serial_number: form.serial_number,
      project_name: form.project_name,
      project_type: form.project_type,
      vintage_year: form.vintage_year,
      quantity_tco2e: parseFloat(form.quantity_tco2e),
      purchase_date: form.purchase_date,
      scope_offset: form.scope_offset,
      retirement_purpose: form.retirement_purpose,
      fy_year_applied: fyYear,
      created_by: user.id,
    });

    if (!error) {
      setShowForm(false);
      loadOffsets();
    }
  }

  async function retireOffset(id: string) {
    await supabase
      .from("carbon_offsets")
      .update({
        is_retired: true,
        retirement_date: new Date().toISOString().split("T")[0],
      })
      .eq("id", id);
    loadOffsets();
  }

  const totalPurchased = offsets.reduce((s, o) => s + Number(o.quantity_tco2e), 0);
  const totalRetired = offsets.filter((o) => o.is_retired).reduce((s, o) => s + Number(o.quantity_tco2e), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Carbon Offsets — {fyYear}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            SEBI BRSR Core requires disclosure of all purchased and retired carbon credits
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-green-600 text-white px-4 py-2 rounded text-sm">
          + Add Offset
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Purchased", value: totalPurchased, color: "text-gray-800" },
          { label: "Retired", value: totalRetired, color: "text-green-600" },
          { label: "Pending Retirement", value: totalPurchased - totalRetired, color: "text-amber-600" },
        ].map((card) => (
          <div key={card.label} className="border rounded-lg p-4">
            <div className="text-xs text-gray-500">{card.label}</div>
            <div className={`text-2xl font-bold mt-1 ${card.color}`}>
              {card.value.toFixed(1)} tCO₂e
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <h3 className="font-medium">Add Carbon Offset Credit</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">Registry</label>
              <select
                value={form.registry_id}
                onChange={(e) => setForm((f) => ({ ...f, registry_id: e.target.value }))}
                className="w-full border rounded px-2 py-1.5 text-sm mt-0.5"
              >
                <option value="">Select registry</option>
                {registries.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Serial Number</label>
              <input
                value={form.serial_number}
                onChange={(e) => setForm((f) => ({ ...f, serial_number: e.target.value }))}
                className="w-full border rounded px-2 py-1.5 text-sm mt-0.5"
                placeholder="Registry serial number"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium">Project Name</label>
              <input
                value={form.project_name}
                onChange={(e) => setForm((f) => ({ ...f, project_name: e.target.value }))}
                className="w-full border rounded px-2 py-1.5 text-sm mt-0.5"
                placeholder="e.g. Rajasthan Wind Farm Project"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Project Type</label>
              <select
                value={form.project_type}
                onChange={(e) => setForm((f) => ({ ...f, project_type: e.target.value }))}
                className="w-full border rounded px-2 py-1.5 text-sm mt-0.5"
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Quantity (tCO₂e)</label>
              <input
                type="number"
                value={form.quantity_tco2e}
                onChange={(e) => setForm((f) => ({ ...f, quantity_tco2e: e.target.value }))}
                className="w-full border rounded px-2 py-1.5 text-sm mt-0.5"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Purchase Date</label>
              <input
                type="date"
                value={form.purchase_date}
                onChange={(e) => setForm((f) => ({ ...f, purchase_date: e.target.value }))}
                className="w-full border rounded px-2 py-1.5 text-sm mt-0.5"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Vintage Year</label>
              <input
                type="number"
                value={form.vintage_year}
                onChange={(e) => setForm((f) => ({ ...f, vintage_year: parseInt(e.target.value) }))}
                className="w-full border rounded px-2 py-1.5 text-sm mt-0.5"
                min="2000"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addOffset} className="bg-green-600 text-white px-4 py-2 rounded text-sm">
              Save Offset
            </button>
            <button onClick={() => setShowForm(false)} className="border px-4 py-2 rounded text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Offsets table */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-3 py-2">Project</th>
            <th className="px-3 py-2">Registry</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2 text-right">tCO₂e</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {offsets.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="px-3 py-2">{o.project_name}</td>
              <td className="px-3 py-2 text-xs">{o.carbon_offset_registries?.name}</td>
              <td className="px-3 py-2 text-xs capitalize">{o.project_type.replace(/_/g, " ")}</td>
              <td className="px-3 py-2 text-right font-mono">{Number(o.quantity_tco2e).toFixed(1)}</td>
              <td className="px-3 py-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${o.is_retired ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {o.is_retired ? "Retired" : "Pending"}
                </span>
              </td>
              <td className="px-3 py-2">
                {!o.is_retired && (
                  <button onClick={() => retireOffset(o.id)} className="text-green-600 text-xs hover:underline">
                    Retire
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}