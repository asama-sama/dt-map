import { useState, useEffect, useMemo } from "react";

import { getAirQualityReadingsBySites } from "../requests/airQuality";

import styles from "./AirQualityXTrafficIncidents.module.css";
import { State, useHookstate } from "@hookstate/core";
import { DatewiseCategorySums, GeoData } from "../types/apiResponseTypes";
import { CategorySumsLineGraph } from "../components/CategorySumsLinegraph";
import { getTrafficIncidentsForSuburbs } from "../requests/trafficIncident";
import { dateToString } from "../util";
import { allSuburbState } from "../state/global";
import { DateRange, IdExistsMap, TemporalAggregate } from "../types";
import { SitesAndBoundariesMap } from "../components/SitesAndBoundariesMap";
import { apis, Apis } from "../consts/SitesAndBoundaries";

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
      >
        {apiKeys.map((key) => (
          <option value={key} key={key} selected={dataSource1 === key}>
            {key}
          </option>
        ))}
      </select>
      <select
        name="apiSelector"
        id="apiSelector"
        onChange={(e) => setDataSource2(e.target.value)}
      >
        {apiKeys.map((key) => (
          <option value={key} key={key} selected={dataSource2 === key}>
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
  const [dataSource1Pre, setDataSource1Pre] =
    useState<State<GeoData[], unknown>>();
  const [airQualitySiteReadings, setAirQualitySiteReadings] =
    useState<DatewiseCategorySums>({});
  const [trafficIncidents, setTrafficIncidents] =
    useState<DatewiseCategorySums>({});
  const [selectedDs2PreElements, setSelectedDs2PreIds] = useState<IdExistsMap>(
    {}
  );
  const [selectedDs1PreIds, setSelectedDs1PreIds] = useState<IdExistsMap>({});
  const fetchStatusesState = useHookstate<FetchStatuses>({
    "ds1-prefetch": false,
    "ds2-prefetch": false,
  });
  const [aggregation, setAggregation] = useState<TemporalAggregate>("day");
  const [dataSource1, setDataSource1] = useState<string>("airQuality");
  const [dataSource2, setDataSource2] = useState<string>("trafficIncidents");

  const selectedDateRangeState = useHookstate<DateRange>(
    initialSelectedDateRange
  );
  const dateRangeState = useHookstate<DateRange>(dateRange);

  useEffect(() => {
    const updateDataSource2 = async () => {
      await apis[dataSource2].prefetch();
      fetchStatusesState.merge(() => ({ "ds2-prefetch": false }));
    };
    fetchStatusesState.merge(() => ({ "ds2-prefetch": true }));
    updateDataSource2();
  }, [dataSource1]);

  useEffect(() => {
    const updateDataSource1 = async () => {
      await apis[dataSource1].prefetch();
      fetchStatusesState.merge(() => ({ "ds1-prefetch": false }));
      setDataSource1Pre(apis[dataSource1].preData);
    };
    fetchStatusesState.merge(() => ({ "ds1-prefetch": true }));
    updateDataSource1();
  }, [dataSource2]);

  useEffect(() => {
    const updateAirQualitySiteData = async () => {
      const { startDate, endDate } = selectedDateRangeState.get();
      const readings = await getAirQualityReadingsBySites(
        Object.keys(selectedDs1PreIds).map(Number),
        new Date(startDate),
        new Date(endDate),
        aggregation
      );
      fetchStatusesState.merge(() => ({ siteReadings: false }));

      setAirQualitySiteReadings(readings);
    };
    fetchStatusesState.merge(() => ({ siteReadings: true }));
    updateAirQualitySiteData();
  }, [selectedDs1PreIds, aggregation, selectedDateRangeState]);

  useEffect(() => {
    const setTrafficIncidentData = async () => {
      const { startDate, endDate } = selectedDateRangeState.get();
      const trafficIncidents = await getTrafficIncidentsForSuburbs(
        Object.keys(selectedDs2PreElements).map(Number),
        new Date(startDate),
        new Date(endDate),
        aggregation
      );
      fetchStatusesState.merge(() => ({ trafficIncidents: false }));

      setTrafficIncidents(trafficIncidents);
    };
    fetchStatusesState.merge(() => ({ trafficIncidents: true }));
    setTrafficIncidentData();
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

  const fetchStatuses = fetchStatusesState.get();

  if (!dataSource1Pre) return;

  return (
    <div className={styles.Overlay}>
      <div className={styles.Lhs}>
        <SitesAndBoundariesMap
          dataSource1PreData={apis[dataSource1].preData.get()}
          dataSource2PreData={apis[dataSource2].preData.get()}
          selectedDs2PreIds={selectedDs2PreElements}
          selectedDs1PreIds={selectedDs1PreIds}
          setSelectedDs2PreIds={setSelectedDs2PreIds}
          setSelectedDs1PreIds={setSelectedDs1PreIds}
          fetchStatuses={fetchStatusesState.get()}
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
        {fetchStatuses.siteReadings || fetchStatuses.trafficIncidents ? (
          <div>Loading...</div>
        ) : (
          <CategorySumsLineGraph
            dataSet1={airQualitySiteReadings}
            dataSet2={trafficIncidents}
            label1={"Air Quality"}
            label2={"Traffic Incidents"}
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
