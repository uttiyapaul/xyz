import { Mail } from "lucide-react";
import Link from "next/link";

import styles from "@/features/auth/AuthScreen.module.css";

export default function VerifyEmailPage() {
  return (
    <div className={styles.centeredState}>
      <div className={styles.stateIcon}>
        <Mail size={48} />
      </div>
      <h1 className={styles.title}>Verify your email</h1>
      <p className={`${styles.stateBody} ${styles.stateBodyTight}`}>
        We sent a confirmation link to your email address. Click it to activate your account before signing in.
      </p>
      <p className={styles.mutedNote}>
        The link expires in 1 hour. Check your spam folder if you don&apos;t see it.
      </p>
      <Link href="/auth/login" className={styles.linkButton}>
        Back to sign in
      </Link>
    </div>
  );
}
