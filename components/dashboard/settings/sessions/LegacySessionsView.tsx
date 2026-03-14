// Legacy route prototype kept during migration out of components/page.tsx naming.
import SessionManager from "@/components/settings/SessionManager";

export default function SessionsPage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <SessionManager />
    </div>
  );
}
