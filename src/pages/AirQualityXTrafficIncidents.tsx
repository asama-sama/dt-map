import { useState, useEffect, useMemo } from "react";

import styles from "./AirQualityXTrafficIncidents.module.css";
import { useHookstate } from "@hookstate/core";
import { CategorySumsLineGraph } from "../components/CategorySumsLinegraph";
import { dateToString } from "../util";
import { DateRange, IdExistsMap, TemporalAggregate } from "../types";
import { SitesAndBoundariesMap } from "../components/SitesAndBoundariesMap";
import { apis, Apis } from "../consts/SitesAndBoundaries";
import { globalState } from "../state/global";
import { StatusIndicator } from "../components/StatusIndicator";

export type FetchStatuses = {
  [key: string]: boolean;
};

type ApiSelectorParams = {
  apis: Apis;
  dataSource1: string;
  dataSource2: string;
  setDataSource1: React.Dispatch<React.SetStateAction<string>>;
  setDataSource2: React.Dispatch<React.SetStateAction<string>>;
};

const ApiSelector = ({
  apis,
  dataSource1,
  dataSource2,
  setDataSource1,
  setDataSource2,
}: ApiSelectorParams) => {
  const apiKeys = Object.keys(apis);
  return (
    <div>
      <select
        name="apiSelector"
        id="apiSelector"
        onChange={(e) => setDataSource1(e.target.value)}
        defaultValue={dataSource1}
      >
        {apiKeys.map((key) => (
          <option value={key} key={key}>
            {key}
          </option>
        ))}
      </select>
      <select
        name="apiSelector"
        id="apiSelector"
        onChange={(e) => setDataSource2(e.target.value)}
        defaultValue={dataSource2}
      >
        {apiKeys.map((key) => (
          <option value={key} key={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
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

  const fetchStatusesState = useHookstate<FetchStatuses>({
    "ds1-prefetch": false,
    "ds2-prefetch": false,
  });
  const selectedDateRangeState = useHookstate<DateRange>(
    initialSelectedDateRange
  );
  const dateRangeState = useHookstate<DateRange>(dateRange);

  useEffect(() => {
    const updateDataSource1 = async () => {
      await apis[dataSource1].prefetch();
      fetchStatusesState.merge(() => ({ "ds1-prefetch": false }));
    };
    fetchStatusesState.merge(() => ({ "ds1-prefetch": true }));
    updateDataSource1();
    setSelectedDs1PreIds({});
    setSelectedDs2PreIds({});
  }, [dataSource1]);

  useEffect(() => {
    const updateDataSource2 = async () => {
      await apis[dataSource2].prefetch();
      fetchStatusesState.merge(() => ({ "ds2-prefetch": false }));
    };
    fetchStatusesState.merge(() => ({ "ds2-prefetch": true }));
    updateDataSource2();
    setSelectedDs2PreIds({});
    setSelectedDs1PreIds({});
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
  }, [
    selectedDs1PreIds,
    aggregation,
    selectedDateRangeState.startDate,
    selectedDateRangeState.endDate,
  ]);

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

  return (
    <div className={styles.Overlay}>
      <div className={styles.Lhs}>
        <StatusIndicator fetchStatuses={fetchStatusesState.get()} />
        <SitesAndBoundariesMap
          dataSource1PreData={globalState[dataSource1].preData.get()}
          dataSource2PreData={globalState[dataSource2].preData.get()}
          selectedDs2PreIds={selectedDs2PreElements}
          selectedDs1PreIds={selectedDs1PreIds}
          setSelectedDs2PreIds={setSelectedDs2PreIds}
          setSelectedDs1PreIds={setSelectedDs1PreIds}
        />
      </div>
      <div className={styles.Rhs}>
        <ApiSelector
          apis={apis}
          dataSource1={dataSource1}
          dataSource2={dataSource2}
          setDataSource1={setDataSource1}
          setDataSource2={setDataSource2}
        />
        {dataSource1State.promised || dataSource2State.promised ? (
          <div>Loading...</div>
        ) : (
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
        )}
      </div>
    </div>
  );
};
