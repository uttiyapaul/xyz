import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

import styles from "@/components/layout/SkeletonPage.module.css";

interface SkeletonPageProps {
  title: string;
  description: string;
}

/**
 * SkeletonPage keeps unfinished modules routable without pretending the live
 * DB-backed implementation exists yet. The styling lives in CSS so placeholder
 * routes follow the no-inline-styles rule too.
 */
export function SkeletonPage({ title, description }: SkeletonPageProps) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/dashboard" className={styles.backLink}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.card}>
        <div className={styles.banner}>
          <span className={styles.bannerIcon}>
            <Zap size={16} />
          </span>
          <span className={styles.bannerText}>Live Database Connection Pending</span>
        </div>

        <div className={styles.content}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <div className={`${styles.skeletonBlock} ${styles.blockWide}`}></div>
              <div className={`${styles.skeletonBlock} ${styles.blockSmall}`}></div>
            </div>
            <div className={`${styles.skeletonBlock} ${styles.blockMedium}`}></div>
          </div>

          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.lineHeader}></div>
              <div className={styles.lineHeader}></div>
              <div className={styles.lineHeader}></div>
              <div className={styles.lineHeader}></div>
              <div className={styles.lineHeader}></div>
            </div>

            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className={styles.tableRow}>
                <div className={`${styles.line} ${styles.line80}`}></div>
                <div className={`${styles.line} ${styles.line40}`}></div>
                <div className={`${styles.line} ${styles.line60}`}></div>
                <div className={`${styles.line} ${styles.line50}`}></div>
                <div className={`${styles.line} ${styles.line70}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
