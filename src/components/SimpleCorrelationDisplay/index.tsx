import { useMemo } from "react";
import { SimpleCorrelationResult } from "../../requests/analysisBE";
import { ThreeCircles } from "react-loader-spinner";

import styles from "./SimpleCorrelationDisplay.module.css";

type SimpleCorrelationDisplayArgs = {
  simpleCorrelationResults: SimpleCorrelationResult[];
  loading: boolean;
};

export const SimpleCorrelationDisplay = ({
  simpleCorrelationResults,
  loading,
}: SimpleCorrelationDisplayArgs) => {
  const correlations = useMemo(() => {
    const correlations = simpleCorrelationResults.sort((a, b) => {
      if (a.Score > b.Score) {
        return -1;
      }
      return 1;
    });
    return correlations.slice(0, 5);
  }, [simpleCorrelationResults]);

  if (correlations.length === 0 && !loading) {
    return <div>Select a region to get correlations</div>;
  }

  if (loading) {
    return (
      <div className={styles.LoaderContainer}>
        Getting correlations...
        <ThreeCircles
          height="100"
          width="100"
          color="#4fa94d"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
          ariaLabel="three-circles-rotating"
          outerCircleColor=""
          innerCircleColor=""
          middleCircleColor=""
        />
      </div>
    );
  }

  return (
    <div className={styles.SimpleCorrelationDisplay}>
      <div className={styles.Header}>
        <span>Column 1</span>
        <span>Column 2</span>
        <span>Correlation</span>
        <span>P-value</span>
      </div>
      {correlations.map((correlation, i) => {
        return (
          <div key={`corr-${i}`} className={styles.CorrelationResult}>
            <span className={styles.CorrelationValue}>
              {correlation.COLUMN1}
            </span>
            <span className={styles.CorrelationValue}>
              {correlation.COLUMN2}
            </span>
            <span className={styles.CorrelationValue}>
              {correlation.CORRELATION.toPrecision(3)}
            </span>
            <span className={styles.CorrelationValue}>
              {correlation.Pvalue.toPrecision(3)}
            </span>
          </div>
        );
      })}
    </div>
  );
};
