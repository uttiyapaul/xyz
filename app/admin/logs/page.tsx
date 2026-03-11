import { createServerSupabaseClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
    const supabaseAdmin = createServerSupabaseClient();

    // Fetch from ghg_audit_log
    const { data: logs, error } = await supabaseAdmin
        .from("ghg_audit_log")
        .select("id, table_name, record_id, operation, changed_by_user_id, event_timestamp, event_hash")
        .order("event_timestamp", { ascending: false })
        .limit(100);

    // We could fetch user emails to map against `changed_by_user_id`, 
    // but for a pure ledger we can display the raw ID or attempt a join if performance allows.

    return (
        <div style={{ padding: "32px", color: "#FAFAF8" }}>
            <div style={{ marginBottom: "28px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>
                    Platform Audit Logs
                </h1>
                <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0 }}>
                    Immutable cryptographic ledger of all platform-wide operational changes.
                </p>
            </div>

            {error ? (
                <div style={{ padding: "16px", background: "rgba(255,59,48,0.1)", color: "#FF3B30", borderRadius: "8px" }}>
                    Failed to load audit logs: {error.message}
                </div>
            ) : (
                <div style={{
                    background: "#0A1628", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "12px", overflowX: "auto"
                }}>
                    <table style={{ minWidth: "1000px", width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#050A14", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                                {["TIMESTAMP", "OPERATION", "TABLE", "RECORD ID", "USER ID", "EVENT HASH"].map(h => (
                                    <th key={h} style={{
                                        padding: "16px 20px", textAlign: "left", fontSize: "11px",
                                        fontWeight: "600", color: "#9CA3AF", letterSpacing: "0.5px"
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(!logs || logs.length === 0) ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#6B7280", fontSize: "14px" }}>
                                        No audit logs available.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log, idx) => (
                                    <tr key={log.id} style={{
                                        background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                                    }}>
                                        <td style={{ padding: "16px 20px", fontSize: "13px", color: "#E5E7EB", fontFamily: "JetBrains Mono, monospace", whiteSpace: "nowrap" }}>
                                            {new Date(log.event_timestamp).toLocaleString()}
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <span style={{
                                                padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "600",
                                                background: log.operation === 'INSERT' ? "rgba(48,209,88,0.1)" : log.operation === 'UPDATE' ? "rgba(245,158,11,0.1)" : "rgba(255,59,48,0.1)",
                                                color: log.operation === 'INSERT' ? "#30D158" : log.operation === 'UPDATE' ? "#F59E0B" : "#FF3B30",
                                            }}>
                                                {log.operation}
                                            </span>
                                        </td>
                                        <td style={{ padding: "16px 20px", fontSize: "13px", color: "#9CA3AF", fontFamily: "JetBrains Mono, monospace" }}>
                                            {log.table_name}
                                        </td>
                                        <td style={{ padding: "16px 20px", fontSize: "12px", color: "#9CA3AF", fontFamily: "JetBrains Mono, monospace" }}>
                                            {log.record_id}
                                        </td>
                                        <td style={{ padding: "16px 20px", fontSize: "12px", color: "#6B7280", fontFamily: "JetBrains Mono, monospace" }}>
                                            {log.changed_by_user_id || "SYSTEM"}
                                        </td>
                                        <td style={{ padding: "16px 20px", fontSize: "11px", color: "#6B7280", fontFamily: "JetBrains Mono, monospace", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }} title={log.event_hash}>
                                            {log.event_hash}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
