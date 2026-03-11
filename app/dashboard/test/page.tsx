"use client";

export default function TestPage() {
  return (
    <div style={{ padding: "40px", background: "#050508", minHeight: "100vh", color: "#FAFAF8" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>✅ Success!</h1>
      <p style={{ fontSize: "18px", marginBottom: "20px" }}>
        You have successfully navigated to the dashboard area.
      </p>
      <p style={{ fontSize: "14px", color: "#9CA3AF" }}>
        This means your authentication is working correctly.
      </p>
      <a 
        href="/dashboard/platform-superadmin" 
        style={{ 
          display: "inline-block", 
          marginTop: "20px", 
          padding: "12px 24px", 
          background: "#F59E0B", 
          color: "#000", 
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "600"
        }}
      >
        Go to Platform Superadmin Dashboard
      </a>
    </div>
  );
}
