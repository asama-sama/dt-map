import { useState, useEffect } from "react";

import {
  AirQualitySite,
  getAirQualityReadingsBySites,
  getAirQualitySites,
} from "../requests/airQuality";

import styles from "./AirQualityXTrafficIncidents.module.css";
import { useHookstate } from "@hookstate/core";
import { DatewiseCategorySums } from "../types/apiResponseTypes";
import { CategorySumsLineGraph } from "../components/CategorySumsLinegraph";
import { Toggleable } from "../types/form";
import {
  getSearchParams,
  getTrafficIncidentsForSuburbs,
  TrafficSearchParams,
} from "../requests/trafficIncident";
import { dateToString } from "../util";
import { getSuburbsByPosition } from "../requests/suburbs";
import { allSuburbState } from "../state/global";
import { IdExistsMap, TemporalAggregate } from "../types";
import { SitesAndBoundariesMap } from "../components/SitesAndBoundariesMap";

export type FetchStatuses = {
  [key: string]: boolean;
};

export const AirQualityXTrafficIncidents = () => {
  const [sites, setSites] = useState<Toggleable<AirQualitySite>[]>([]);
  const [airQualitySiteReadings, setAirQualitySiteReadings] =
    useState<DatewiseCategorySums>({});
  const [trafficIncidents, setTrafficIncidents] =
    useState<DatewiseCategorySums>({});
  const [labels, setLabels] = useState<string[]>([]);
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
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      const endDate = new Date();

      const readings = await getAirQualityReadingsBySites(
        Object.keys(selectedAirQualitySites).map(Number),
        startDate,
        endDate,
        aggregation
      );
      fetchStatusesState.merge(() => ({ siteReadings: false }));

      setAirQualitySiteReadings(readings);
    };
    fetchStatusesState.merge(() => ({ siteReadings: true }));
    updateAirQualitySiteData();
  }, [selectedAirQualitySites, aggregation]);

  useEffect(() => {
    const setTrafficIncidentData = async () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      const endDate = new Date();

      const trafficIncidents = await getTrafficIncidentsForSuburbs(
        Object.keys(selectedSuburbs).map(Number),
        startDate,
        endDate,
        aggregation
      );
      fetchStatusesState.merge(() => ({ trafficIncidents: false }));

      setTrafficIncidents(trafficIncidents);

      const labels = getLabels(startDate);
      setLabels(labels);
    };
    fetchStatusesState.merge(() => ({ trafficIncidents: true }));
    setTrafficIncidentData();
  }, [selectedSuburbs, aggregation]);

  const getLabels = (startDate: Date) => {
    const labels: string[] = [];
    const currentDate = new Date();
    if (aggregation === "month") {
      startDate.setDate(1);
    }
    if (aggregation === "year") {
      startDate.setMonth(0);
    }
    while (startDate < currentDate) {
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
            labels={labels}
            aggregation={aggregation}
            setAggregation={setAggregation}
          />
        )}
      </div>
    </div>
  );
};
