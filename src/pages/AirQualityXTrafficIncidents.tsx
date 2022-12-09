import { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMapEvents,
  Rectangle,
  GeoJSON,
} from "react-leaflet";
import intersect from "@turf/intersect";
import pointsWithinPolygon from "@turf/points-within-polygon";
import { points } from "@turf/helpers";
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
import { dateToString, polygonFromRectangle } from "../util";
import { getSuburbsByPosition } from "../requests/suburbs";
import { allSuburbState } from "../state/global";
import { Suburb, TemporalAggregate } from "../types";
import { LatLngArray, Rectangle as RectangleData } from "../types/geography";

export type FetchStatuses = {
  fetchingSiteReadings: boolean;
  fetchingTrafficIncidents: boolean;
};

type SetRectangleFn = (rectangle: RectangleData | undefined) => void;
type MapControlsProps = {
  setRectangle: SetRectangleFn;
};

const MapControls = ({ setRectangle }: MapControlsProps) => {
  const [point1, setPoint1] = useState<LatLngArray>();
  const [drawRectangle, setDrawRectangle] = useState(false);
  const [currentRectangle, setCurrentRectangle] = useState<RectangleData>();
  useMapEvents({
    click(e) {
      if (!drawRectangle) return;
      if (!point1) {
        setPoint1([e.latlng.lat, e.latlng.lng]);
      }
      if (point1) {
        setRectangle([point1, [e.latlng.lat, e.latlng.lng]]);
        setDrawRectangle(false);
      }
    },
    mousemove(e) {
      const { lat, lng } = e.latlng;
      if (drawRectangle && point1) {
        const bounds: RectangleData = [point1, [lat, lng]];
        setCurrentRectangle(bounds);
      }
    },
  });

  const startDrawRectangle = () => {
    if (!drawRectangle) {
      setDrawRectangle(true);
      setCurrentRectangle(undefined);
      setPoint1(undefined);
    }
  };

  return (
    <>
      <div
        className={`${styles.drawRectangle} ${
          drawRectangle ? styles.drawing : ""
        }`}
        onClick={() => startDrawRectangle()}
      ></div>
      {currentRectangle && drawRectangle && (
        <Rectangle
          bounds={currentRectangle}
          pathOptions={{ color: "lime", fillColor: "none" }}
        />
      )}
    </>
  );
};

type IdExistsMap = { [key: number]: boolean };

const AirQualitySitesMap = ({
  sites,
  suburbs,
  selectedSuburbs,
  selectedAirQualitySites,
  setSelectedSuburbs,
  setSelectedAirQualitySites,
}: {
  sites: Toggleable<AirQualitySite>[];
  suburbs: Suburb[];
  selectedSuburbs: IdExistsMap;
  selectedAirQualitySites: IdExistsMap;
  setSelectedSuburbs: (suburbs: IdExistsMap) => void;
  setSelectedAirQualitySites: (sites: IdExistsMap) => void;
}) => {
  const [rectangle, setRectangle] = useState<RectangleData>();

  useEffect(() => {
    if (!rectangle) {
      setSelectedAirQualitySites({});
      setSelectedSuburbs({});
      return;
    }
    const rect = polygonFromRectangle(rectangle);
    const suburbIds = suburbs.reduce<IdExistsMap>((suburbIds, suburb) => {
      const intersection = suburb.boundary && intersect(suburb.boundary, rect);
      if (intersection) {
        const newSuburbIds = { ...suburbIds };
        newSuburbIds[suburb.id] = true;
        return newSuburbIds;
      }
      return suburbIds;
    }, {});
    setSelectedSuburbs(suburbIds);

    const siteIds = sites.reduce<IdExistsMap>((siteIds, site) => {
      const sitePoint = points([
        [site.position.coordinates[0], site.position.coordinates[1]],
      ]);
      const pointsWithin = pointsWithinPolygon(sitePoint, rect);
      if (pointsWithin.features.length > 0) {
        const newSiteIds = { ...siteIds };
        newSiteIds[site.id] = true;
        return newSiteIds;
      }
      return siteIds;
    }, {});
    setSelectedAirQualitySites(siteIds);
  }, [rectangle]);

  const suburbsMemo = useMemo(() => {
    const suburbGeo = suburbs.map((suburb) => {
      let color = `#a6a6a6`;
      if (selectedSuburbs[suburb.id]) {
        color = "#ffed32";
      }
      if (!suburb.boundary) return <></>;
      return (
        <GeoJSON
          key={`suburub-${suburb.id}`}
          data={suburb.boundary}
          style={{ color }}
        />
      );
    });

    return <>{suburbGeo}</>;
  }, [suburbs, selectedSuburbs]);

  const airSitesMemo = useMemo(() => {
    const sitesElms = sites.map((site) => {
      const siteInRect = selectedAirQualitySites[site.id];
      return (
        <CircleMarker
          key={`site-${site.id}`}
          center={[site.position.coordinates[1], site.position.coordinates[0]]}
          radius={5}
          pathOptions={{
            color: siteInRect ? "#ff8181" : "#4391c3",
            fillColor: siteInRect ? "#ff8181" : "#4391c3",
            fillOpacity: 1,
          }}
          pane={"markerPane"}
        ></CircleMarker>
      );
    });
    return sitesElms;
  }, [sites, selectedAirQualitySites]);

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
      <MapControls setRectangle={setRectangle} />
      {suburbsMemo}
      {airSitesMemo}
    </MapContainer>
  );
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
  const [fetchStatuses, setFetchStatuses] = useState<FetchStatuses>({
    fetchingSiteReadings: false,
    fetchingTrafficIncidents: false,
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
      suburbState.set(suburbs);
    };
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

      setFetchStatuses({
        ...fetchStatuses,
        fetchingSiteReadings: true,
      });
      const readings = await getAirQualityReadingsBySites(
        Object.keys(selectedAirQualitySites).map(Number),
        startDate,
        endDate,
        aggregation
      );
      setFetchStatuses({
        ...fetchStatuses,
        fetchingSiteReadings: false,
      });
      setAirQualitySiteReadings(readings);
    };
    updateAirQualitySiteData();
  }, [selectedAirQualitySites, aggregation]);

  useEffect(() => {
    const setTrafficIncidentData = async () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      const endDate = new Date();
      setFetchStatuses({
        ...fetchStatuses,
        fetchingTrafficIncidents: true,
      });
      const trafficIncidents = await getTrafficIncidentsForSuburbs(
        Object.keys(selectedSuburbs).map(Number),
        startDate,
        endDate,
        aggregation
      );
      setFetchStatuses({
        ...fetchStatuses,
        fetchingTrafficIncidents: false,
      });
      setTrafficIncidents(trafficIncidents);

      const labels = getLabels(startDate);
      setLabels(labels);
    };
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
  return (
    <div className={styles.Overlay}>
      <div className={styles.Lhs}>
        <AirQualitySitesMap
          sites={sites}
          suburbs={suburbState.get()}
          selectedSuburbs={selectedSuburbs}
          selectedAirQualitySites={selectedAirQualitySites}
          setSelectedSuburbs={setSelectedSuburbs}
          setSelectedAirQualitySites={setSelectedAirQualitySites}
        />
      </div>
      <div className={styles.Rhs}>
        {fetchStatuses.fetchingSiteReadings ||
        fetchStatuses.fetchingTrafficIncidents ? (
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
