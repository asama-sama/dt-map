import { useState, useEffect, useMemo } from "react";

import {
  getAirQualityReadingsBySites,
  getAirQualitySites,
} from "../requests/airQuality";

import styles from "./AirQualityXTrafficIncidents.module.css";
import { useHookstate } from "@hookstate/core";
import { DatewiseCategorySums, GeoData } from "../types/apiResponseTypes";
import { CategorySumsLineGraph } from "../components/CategorySumsLinegraph";
import { Toggleable } from "../types/form";
import {
  getSearchParams,
  getTrafficIncidentsForSuburbs,
  TrafficSearchParams,
  getSuburbsByPosition,
} from "../requests/trafficIncident";
import { dateToString } from "../util";
import { allSuburbState } from "../state/global";
import { DateRange, IdExistsMap, TemporalAggregate } from "../types";
import { SitesAndBoundariesMap } from "../components/SitesAndBoundariesMap";

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
  const [sites, setSites] = useState<Toggleable<GeoData>[]>([]);
  const [airQualitySiteReadings, setAirQualitySiteReadings] =
    useState<DatewiseCategorySums>({});
  const [trafficIncidents, setTrafficIncidents] =
    useState<DatewiseCategorySums>({});
  const [selectedSuburbs, setSelectedSuburbs] = useState<IdExistsMap>({});
  const [selectedAirQualitySites, setSelectedAirQualitySites] =
    useState<IdExistsMap>({});
  const fetchStatusesState = useHookstate<FetchStatuses>({
    siteReadings: false,
    trafficIncidents: false,
    suburbs: false,
  });
  const [trafficIncidentSearchParams, setTrafficIncidentSearchParams] =
    useState<TrafficSearchParams>();
  const [aggregation, setAggregation] = useState<TemporalAggregate>("day");

  const selectedDateRangeState = useHookstate<DateRange>(
    initialSelectedDateRange
  );
  const dateRangeState = useHookstate<DateRange>(dateRange);
  const suburbState = useHookstate(allSuburbState);

  useEffect(() => {
    const updateSearchParams = async () => {
      const searchParams = await getSearchParams();
      setTrafficIncidentSearchParams(searchParams);
    };
    updateSearchParams();
  }, []);

  useEffect(() => {
    const getSuburbs = async () => {
      if (!trafficIncidentSearchParams) return;
      const { longitude, latitude, radius } = trafficIncidentSearchParams;
      const suburbs = await getSuburbsByPosition(longitude, latitude, radius);
      fetchStatusesState.merge(() => ({ suburbs: false }));
      suburbState.set(suburbs);
    };
    fetchStatusesState.merge(() => ({ suburbs: true }));
    getSuburbs();
  }, [trafficIncidentSearchParams]);

  useEffect(() => {
    const getAndSetAirQualitySites = async () => {
      const sites = await getAirQualitySites();
      const toggledSites = sites.map((site) => ({ ...site, on: false }));
      setSites(toggledSites);
    };
    getAndSetAirQualitySites();
  }, []);

  useEffect(() => {
    const updateAirQualitySiteData = async () => {
      const { startDate, endDate } = selectedDateRangeState.get();
      const readings = await getAirQualityReadingsBySites(
        Object.keys(selectedAirQualitySites).map(Number),
        new Date(startDate),
        new Date(endDate),
        aggregation
      );
      fetchStatusesState.merge(() => ({ siteReadings: false }));

      setAirQualitySiteReadings(readings);
    };
    fetchStatusesState.merge(() => ({ siteReadings: true }));
    updateAirQualitySiteData();
  }, [selectedAirQualitySites, aggregation, selectedDateRangeState]);

  useEffect(() => {
    const setTrafficIncidentData = async () => {
      const { startDate, endDate } = selectedDateRangeState.get();
      const trafficIncidents = await getTrafficIncidentsForSuburbs(
        Object.keys(selectedSuburbs).map(Number),
        new Date(startDate),
        new Date(endDate),
        aggregation
      );
      fetchStatusesState.merge(() => ({ trafficIncidents: false }));

      setTrafficIncidents(trafficIncidents);
    };
    fetchStatusesState.merge(() => ({ trafficIncidents: true }));
    setTrafficIncidentData();
  }, [selectedSuburbs, aggregation, selectedDateRangeState]);

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
  return (
    <div className={styles.Overlay}>
      <div className={styles.Lhs}>
        <SitesAndBoundariesMap
          sites={sites}
          suburbs={suburbState.get()}
          selectedSuburbs={selectedSuburbs}
          selectedAirQualitySites={selectedAirQualitySites}
          setSelectedSuburbs={setSelectedSuburbs}
          setSelectedAirQualitySites={setSelectedAirQualitySites}
          fetchStatuses={fetchStatusesState.get()}
        />
      </div>
      <div className={styles.Rhs}>
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
