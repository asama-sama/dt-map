import { FetchStatuses } from "../../pages/AirQualityXTrafficIncidents";
import styles from "./StatusIndicator.module.css";

export const StatusIndicator = ({
  fetchStatuses,
}: {
  fetchStatuses: FetchStatuses;
}) => (
  <div className={styles.statusesIndicator}>
    <h2>Fetch Status</h2>
    {Object.keys(fetchStatuses).map((status) => {
      const loading = fetchStatuses[status];
      return (
        <div key={status} className={`${styles.statusGroup}`}>
          <span>{status}</span>
          <span
            className={`${styles.status} ${
              loading ? styles.loading : styles.loaded
            }`}
          >
            {loading ? "fetching" : "loaded"}
          </span>
        </div>
      );
    })}
  </div>
);
