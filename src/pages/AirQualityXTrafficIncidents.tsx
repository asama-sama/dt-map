import { useState, useEffect, useMemo } from "react";
import { useHookstate } from "@hookstate/core";

import styles from "./AirQualityXTrafficIncidents.module.css";
import { CategorySumsLineGraph } from "../components/CategorySumsLinegraph";
import { dateToString } from "../util";
import { DateRange, IdExistsMap, TemporalAggregate } from "../types";
import { SitesAndBoundariesMap } from "../components/SitesAndBoundariesMap";
import { apis } from "../consts/SitesAndBoundaries";
import { globalState } from "../state/global";
import { StatusIndicator } from "../components/StatusIndicator";
import { Rectangle } from "../types/geography";
import {
  getSimpleCorrelation,
  SimpleCorrelationResult,
} from "../requests/analysisBE";
import { API_CORRELATION_MAP } from "../consts/AnalysisBE";
import { polygonFromRectangle, polygonToString } from "../util/geometry";
import { SimpleCorrelationDisplay } from "../components/SimpleCorrelationDisplay";
import { ApiSelector } from "../components/ApiSelector";

export type FetchStatuses = {
  [key: string]: boolean;
};

const initialStartDate = new Date();
initialStartDate.setMonth(initialStartDate.getMonth() - 3);

const initialSelectedDateRange: DateRange = {
  startDate: dateToString(initialStartDate),
  endDate: dateToString(new Date()),
};

const startDate = new Date();
startDate.setFullYear(startDate.getFullYear() - 3);
const dateRange: DateRange = {
  startDate: dateToString(startDate),
  endDate: dateToString(new Date()),
};

export const AirQualityXTrafficIncidents = () => {
  const [selectedDs2PreElements, setSelectedDs2PreIds] = useState<IdExistsMap>(
    {}
  );
  const [selectedDs1PreIds, setSelectedDs1PreIds] = useState<IdExistsMap>({});

  const [aggregation, setAggregation] = useState<TemporalAggregate>("day");
  const [dataSource1, setDataSource1] = useState<string>("airQuality");
  const [dataSource2, setDataSource2] = useState<string>("trafficIncidents");
  const [selectedRectangle, setSelectedRectangle] = useState<Rectangle>();
  const [currentRectangle, setCurrentRectangle] = useState<Rectangle>();
  const [simpleCorrelation, setSimpleCorrelation] = useState<
    SimpleCorrelationResult[]
  >([]);

  const fetchStatusesState = useHookstate<FetchStatuses>({
    "ds1-prefetch": false,
    "ds2-prefetch": false,
  });
  const selectedDateRangeState = useHookstate<DateRange>(
    initialSelectedDateRange
  );
  const dateRangeState = useHookstate<DateRange>(dateRange);

  const resetState = () => {
    setSelectedDs1PreIds({});
    setSelectedDs2PreIds({});
    setSelectedRectangle(undefined);
    setCurrentRectangle(undefined);
    setSimpleCorrelation([]);
  };

  useEffect(() => {
    const updateDataSource1 = async () => {
      await apis[dataSource1].prefetch();
      fetchStatusesState.merge(() => ({ "ds1-prefetch": false }));
    };
    fetchStatusesState.merge(() => ({ "ds1-prefetch": true }));
    updateDataSource1();
    resetState();
  }, [dataSource1]);

  useEffect(() => {
    const updateDataSource2 = async () => {
      await apis[dataSource2].prefetch();
      fetchStatusesState.merge(() => ({ "ds2-prefetch": false }));
    };
    fetchStatusesState.merge(() => ({ "ds2-prefetch": true }));
    updateDataSource2();
    resetState();
  }, [dataSource2]);

  useEffect(() => {
    if (!selectedDs1PreIds) return;
    const updateDataSource1 = async () => {
      const { startDate, endDate } = selectedDateRangeState.get();
      await apis[dataSource1].datafetch(
        Object.keys(selectedDs1PreIds).map(Number),
        new Date(startDate),
        new Date(endDate),
        aggregation
      );
      fetchStatusesState.merge(() => ({ "ds1-data": false }));
    };
    fetchStatusesState.merge(() => ({ "ds1-data": true }));
    updateDataSource1();
  }, [selectedDs1PreIds, aggregation, selectedDateRangeState]);

  useEffect(() => {
    const updateDataSource2 = async () => {
      const { startDate, endDate } = selectedDateRangeState.get();
      await apis[dataSource2].datafetch(
        Object.keys(selectedDs1PreIds).map(Number),
        new Date(startDate),
        new Date(endDate),
        aggregation
      );
      fetchStatusesState.merge(() => ({ "ds2-data": false }));
    };
    fetchStatusesState.merge(() => ({ "ds2-data": true }));
    updateDataSource2();
  }, [selectedDs2PreElements, aggregation, selectedDateRangeState]);

  useEffect(() => {
    setSimpleCorrelation([]);
  }, [selectedDateRangeState, selectedRectangle]);

  const runSimpleCorrelation = async () => {
    if (!selectedRectangle) return;
    fetchStatusesState.merge(() => ({ correlation: true }));
    const ds1 = API_CORRELATION_MAP[dataSource1];
    const ds2 = API_CORRELATION_MAP[dataSource2];
    const { startDate, endDate } = selectedDateRangeState.get();
    const polygon = polygonFromRectangle(selectedRectangle);
    const polygonString = polygonToString(polygon);
    const res = await getSimpleCorrelation(
      ds1,
      ds2,
      startDate,
      endDate,
      polygonString
    );
    setSimpleCorrelation(res);
    fetchStatusesState.merge(() => ({ correlation: false }));
  };

  const getLabels = (startDate: Date, endDate: Date) => {
    const labels: string[] = [];
    if (aggregation === "month") {
      startDate.setDate(1);
    }
    if (aggregation === "year") {
      startDate.setMonth(0);
    }
    while (startDate < endDate) {
      const dateString = dateToString(startDate);
      labels.push(dateString);
      if (aggregation === "day") {
        startDate.setDate(startDate.getDate() + 1);
      } else if (aggregation === "month") {
        startDate.setMonth(startDate.getMonth() + 1);
      } else if (aggregation === "year") {
        startDate.setFullYear(startDate.getFullYear() + 1);
      }
    }
    return labels;
  };

  const graphLabels = useMemo(() => {
    const { startDate, endDate } = selectedDateRangeState.get();
    const labels = getLabels(new Date(startDate), new Date(endDate));
    return labels;
  }, [selectedDateRangeState, aggregation]);

  const sliderLabels = useMemo(() => {
    const { startDate: _startDate, endDate: _endDate } = dateRangeState.get();
    const startDate = new Date(_startDate);
    const endDate = new Date(_endDate);
    const labels = getLabels(startDate, endDate);
    return labels;
  }, [dateRange]);

  const dataSource1State = useHookstate(globalState[dataSource1].data);
  const dataSource2State = useHookstate(globalState[dataSource2].data);

  const fetchStatuses = fetchStatusesState.get();

  let granularity = "";
  if (aggregation === "day") {
    granularity = "daily";
  } else if (aggregation === "month") {
    granularity = "monthly";
  } else if (aggregation === "year") {
    granularity = "yearly";
  }

  const correlationForGranularity = simpleCorrelation.filter((corr) => {
    return corr.tGranularity === granularity;
  });

  return (
    <div className={styles.Page}>
      <div className={styles.Lhs}>
        <div className={styles.Overlay}>
          <ApiSelector
            apis={apis}
            dataSource1={dataSource1}
            dataSource2={dataSource2}
            setDataSource1={setDataSource1}
            setDataSource2={setDataSource2}
          />
        </div>

        <StatusIndicator fetchStatuses={fetchStatuses} />
        <SitesAndBoundariesMap
          dataSource1PreData={globalState[dataSource1].preData.get()}
          dataSource2PreData={globalState[dataSource2].preData.get()}
          selectedDs2PreIds={selectedDs2PreElements}
          selectedDs1PreIds={selectedDs1PreIds}
          selectedRectangle={selectedRectangle}
          currentRectangle={currentRectangle}
          setSelectedDs2PreIds={setSelectedDs2PreIds}
          setSelectedDs1PreIds={setSelectedDs1PreIds}
          setSelectedRectangle={setSelectedRectangle}
          setCurrentRectangle={setCurrentRectangle}
        />
      </div>
      <div className={styles.Rhs}>
        <h3>Correlations ({granularity})</h3>
        <SimpleCorrelationDisplay
          simpleCorrelationResults={correlationForGranularity}
          loading={fetchStatuses.correlation}
          getCorrelations={runSimpleCorrelation}
        />

        <div className={styles.Linebreak}></div>
        {dataSource1State.promised || dataSource2State.promised ? (
          <div>Loading...</div>
        ) : (
          <div className={styles.Graph}>
            <CategorySumsLineGraph
              dataSet1={dataSource1State.get()}
              dataSet2={dataSource2State.get()}
              label1={dataSource1}
              label2={dataSource2}
              sliderLabels={sliderLabels}
              graphLabels={graphLabels}
              aggregation={aggregation}
              setAggregation={setAggregation}
              selectedDateRangeState={selectedDateRangeState}
            />
          </div>
        )}
      </div>
    </div>
  );
};
