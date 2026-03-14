"use client";

import { useMemo, useState } from "react";

import { approveLead } from "./actions";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  last_sign_in_at: string | null;
  created_at: string;
  role: string;
  org_name: string;
  is_active: boolean;
}

interface Org {
  id: string;
  legal_name: string;
}

interface Role {
  id: string;
  role_name: string;
}

export function UsersClient({
  users,
  organizations,
  roles,
}: {
  users: UserRow[];
  organizations: Org[];
  roles: Role[];
}) {
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        activeTab === "pending"
          ? user.role === "pending_approval"
          : user.role !== "pending_approval",
      ),
    [activeTab, users],
  );

  async function handleApprove() {
    if (!selectedUser || !selectedOrg || !selectedRole) {
      setError("Please select an organization and a role.");
      return;
    }

    setLoading(true);
    setError(null);

    const response = await approveLead(selectedUser.id, selectedOrg, selectedRole);

    if (response.error) {
      setError(response.error);
      setLoading(false);
      return;
    }

    window.location.reload();
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          borderBottom: "1px solid #1A1A24",
        }}
      >
        <button
          onClick={() => setActiveTab("active")}
          style={{
            background: "transparent",
            border: "none",
            color: activeTab === "active" ? "#00D4FF" : "#9CA3AF",
            borderBottom:
              activeTab === "active"
                ? "2px solid #00D4FF"
                : "2px solid transparent",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Active Users
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          style={{
            background: "transparent",
            border: "none",
            color: activeTab === "pending" ? "#F59E0B" : "#9CA3AF",
            borderBottom:
              activeTab === "pending"
                ? "2px solid #F59E0B"
                : "2px solid transparent",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Pending Leads
          {users.some((user) => user.role === "pending_approval") && (
            <span
              style={{
                background: "#F59E0B",
                color: "#000",
                padding: "2px 6px",
                borderRadius: "999px",
                fontSize: "10px",
                marginLeft: "8px",
                fontWeight: "700",
              }}
            >
              {users.filter((user) => user.role === "pending_approval").length}
            </span>
          )}
        </button>
      </div>

      <div
        style={{
          background: "#0A1628",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "12px",
          overflowX: "auto",
        }}
      >
        <table
          style={{ minWidth: "800px", width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr
              style={{
                background: "#050A14",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {["NAME & EMAIL", "ORGANIZATION", "ROLE", "STATUS", "JOINED", ""].map(
                (header) => (
                  <th
                    key={header}
                    style={{
                      padding: "16px 20px",
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#9CA3AF",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#6B7280",
                    fontSize: "14px",
                  }}
                >
                  No users found in this category.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  style={{
                    background:
                      index % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    transition: "background 0.2s",
                  }}
                  className="hover:bg-[rgba(0,212,255,0.05)]"
                >
                  <td style={{ padding: "16px 20px" }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#FAFAF8",
                      }}
                    >
                      {user.full_name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#9CA3AF",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {user.email}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "16px 20px",
                      fontSize: "13px",
                      color: "#FAFAF8",
                    }}
                  >
                    {user.org_name}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.06)",
                        color: "#E5E7EB",
                        fontSize: "11px",
                        fontWeight: "500",
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    {user.role === "pending_approval" ? (
                      <span
                        style={{
                          color: "#F59E0B",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#F59E0B",
                          }}
                        />
                        Pending
                      </span>
                    ) : user.is_active ? (
                      <span
                        style={{
                          color: "#30D158",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#30D158",
                          }}
                        />
                        Active
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "#FF3B30",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#FF3B30",
                          }}
                        />
                        Suspended
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "16px 20px",
                      fontSize: "12px",
                      color: "#9CA3AF",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    {user.role === "pending_approval" ? (
                      <button
                        onClick={() => setSelectedUser(user)}
                        style={{
                          background: "#0066FF",
                          color: "#FFF",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        Verify Lead
                      </button>
                    ) : (
                      <button
                        style={{
                          background: "transparent",
                          color: "#00D4FF",
                          border: "1px solid rgba(0,212,255,0.3)",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(5, 10, 20, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#0A1628",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "8px",
                color: "#FAFAF8",
              }}
            >
              Verify Lead
            </h2>
            <p style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "24px" }}>
              Assign {selectedUser.full_name} ({selectedUser.email}) to an
              organization and platform role.
            </p>

            {error && (
              <div
                style={{
                  padding: "12px",
                  background: "rgba(255,59,48,0.1)",
                  border: "1px solid rgba(255,59,48,0.2)",
                  borderRadius: "6px",
                  color: "#FF3B30",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#9CA3AF",
                  marginBottom: "8px",
                }}
              >
                Organization
              </label>
              <select
                value={selectedOrg}
                onChange={(event) => setSelectedOrg(event.target.value)}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  color: "#FAFAF8",
                  fontSize: "14px",
                  outline: "none",
                }}
              >
                <option value="" disabled>
                  Select an organization
                </option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.legal_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#9CA3AF",
                  marginBottom: "8px",
                }}
              >
                Platform Role
              </label>
              <select
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  color: "#FAFAF8",
                  fontSize: "14px",
                  outline: "none",
                }}
              >
                <option value="" disabled>
                  Select a role
                </option>
                {roles
                  .filter((role) => role.role_name !== "pending_approval")
                  .map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setError(null);
                }}
                style={{
                  padding: "0 20px",
                  height: "44px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  color: "#FAFAF8",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                style={{
                  padding: "0 24px",
                  height: "44px",
                  background: "linear-gradient(135deg, #00D4FF 0%, #0066FF 100%)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#FFF",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                disabled={loading}
              >
                {loading ? "Approving..." : "Approve & Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
