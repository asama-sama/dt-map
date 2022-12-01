import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle } from "react-leaflet";
import {
  AirQualitySite,
  getAirQualityReadingsBySite,
  getAirQualitySites,
} from "../requests/airQuality";

import styles from "./AirQualityXTrafficIncidents.module.css";
import { useHookstate } from "@hookstate/core";
import { DatewiseCategorySums } from "../types/apiResponseTypes";
import { CategorySumsLineGraph } from "../components/CategorySumsLinegraph";
import { Toggleable } from "../types/form";
import { getTrafficIncidentsForPosition } from "../requests/trafficIncident";
import { dateToString } from "../util";

const RADIUS = 3000;

const AirQualitySitesMap = ({
  sites,
  setSites,
}: {
  sites: Toggleable<AirQualitySite>[];
  setSites: React.Dispatch<Toggleable<AirQualitySite>[]>;
}) => {
  return (
    <MapContainer
      center={[-33.879, 151]}
      zoom={10}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", position: "absolute" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {sites.map((site) => {
        return (
          <Circle
            key={`site-${site.id}`}
            center={[
              site.position.coordinates[1],
              site.position.coordinates[0],
            ]}
            radius={3000}
            eventHandlers={{
              click: () => {
                const newSites = sites.map((s) => ({
                  ...s,
                  on: s.id === site.id ? true : false,
                }));
                setSites(newSites);
              },
            }}
            pathOptions={{ color: site.on ? "#c3ad43" : "#4391c3" }}
          ></Circle>
        );
      })}
    </MapContainer>
  );
};

type AirQualityReadingsBySite = {
  [siteId: number]: DatewiseCategorySums;
};

export const AirQualityXTrafficIncidents = () => {
  const [sites, setSites] = useState<Toggleable<AirQualitySite>[]>([]);
  const [airQualitySiteReadings, setAirQualitySiteReadings] =
    useState<DatewiseCategorySums>({});
  const [trafficIncidents, setTrafficIncidents] =
    useState<DatewiseCategorySums>({});
  const [labels, setLabels] = useState<string[]>([]);

  const airQualityReadingsBySiteState = useHookstate<AirQualityReadingsBySite>(
    {}
  );

  useEffect(() => {
    const getAndSetAirQualitySites = async () => {
      const sites = await getAirQualitySites();
      const toggledSites = sites.map((site) => ({ ...site, on: false }));
      setSites(toggledSites);
    };
    getAndSetAirQualitySites();
  }, []);

  // get airquality readings for selected site
  useEffect(() => {
    const updateAirQualityTrafficIncidentData = async (
      site: AirQualitySite
    ) => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      const endDate = new Date();

      const airQualityReadingsBySite = airQualityReadingsBySiteState.get();
      let readings: DatewiseCategorySums = airQualityReadingsBySite[site.id];

      if (!readings) {
        readings = await getAirQualityReadingsBySite(site.id, startDate);
        airQualityReadingsBySiteState[site.id].set(readings);
      }
      setAirQualitySiteReadings(readings);

      const [lng, lat] = site.position.coordinates;

      const trafficIncidents = await getTrafficIncidentsForPosition(
        lat,
        lng,
        startDate,
        endDate,
        RADIUS
      );
      setTrafficIncidents(trafficIncidents);

      const labels = getLabels(startDate);
      setLabels(labels);
    };

    const site = sites.find((site) => site.on);
    if (site) {
      updateAirQualityTrafficIncidentData(site);
    }
  }, [sites]);

  const getLabels = (startDate: Date) => {
    const labels: string[] = [];
    const currentDate = new Date();
    while (startDate < currentDate) {
      const dateString = dateToString(startDate);
      labels.push(dateString);
      startDate.setDate(startDate.getDate() + 1);
    }
    return labels;
  };
  return (
    <div className={styles.Overlay}>
      <div className={styles.Lhs}>
        <AirQualitySitesMap sites={sites} setSites={setSites} />
      </div>
      <div className={styles.Rhs}>
        <CategorySumsLineGraph
          dataSet1={airQualitySiteReadings}
          dataSet2={trafficIncidents}
          label1={"Air Quality"}
          label2={"Traffic Incidents"}
          labels={labels}
        />
      </div>
    </div>
  );
};
