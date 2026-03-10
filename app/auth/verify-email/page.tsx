// app/auth/verify-email/page.tsx
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>✉</div>
      <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#FAFAF8",
        margin: "0 0 12px" }}>
        Verify your email
      </h1>
      <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.7",
        marginBottom: "24px" }}>
        We sent a confirmation link to your email address.
        Click it to activate your account before signing in.
      </p>
      <p style={{ fontSize: "12px", color: "#4B5563", marginBottom: "28px" }}>
        The link expires in 1 hour. Check your spam folder if you don&apos;t see it.
      </p>
      <Link href="/auth/login" style={{
        display: "inline-block", padding: "10px 24px",
        background: "#F59E0B", borderRadius: "6px",
        color: "#000", fontSize: "14px", fontWeight: "600", textDecoration: "none",
      }}>
        Back to sign in
      </Link>
    </div>
  );
}