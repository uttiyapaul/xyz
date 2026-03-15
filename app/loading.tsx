import styles from "@/app/AppState.module.css";

export default function GlobalLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.spinner} />
        <div className={styles.loadingLabel}>LOADING</div>
      </div>
    </div>
  );
}
