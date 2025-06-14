import styles from "./OfflineMessage.module.css";

export const OfflineMessage = () => {
  return (
    <div className={styles.offlineMessage}>
      <strong>⚠️ You are offline</strong>
      <p className={styles.message}>
        Some features may be limited. The map will show the last known position of the bus.
      </p>
    </div>
  );
};
