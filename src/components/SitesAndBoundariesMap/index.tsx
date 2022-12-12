import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMapEvents,
  Rectangle,
  GeoJSON,
} from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import { LatLngArray, Rectangle as RectangleData } from "../../types/geography";
import { IdExistsMap } from "../../types";
import { Toggleable } from "../../types/form";
import { polygonFromRectangle } from "../../util";
import intersect from "@turf/intersect";
import { points } from "@turf/helpers";
import pointsWithinPolygon from "@turf/points-within-polygon";

import styles from "./SitesAndBoundariesMap.module.css";
import { FetchStatuses } from "../../pages/AirQualityXTrafficIncidents";
import { GeoData, GeoDataPolygon } from "../../types/apiResponseTypes";

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

export const SitesAndBoundariesMap = ({
  sites,
  suburbs,
  fetchStatuses,
  selectedSuburbs,
  selectedAirQualitySites,
  setSelectedSuburbs,
  setSelectedAirQualitySites,
}: {
  sites: Toggleable<GeoData>[];
  suburbs: GeoDataPolygon[];
  fetchStatuses: FetchStatuses;
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
      const intersection = suburb.geometry && intersect(suburb.geometry, rect);
      if (intersection) {
        const newSuburbIds: IdExistsMap = { ...suburbIds };
        newSuburbIds[suburb.id] = true;
        return newSuburbIds;
      }
      return suburbIds;
    }, {});
    setSelectedSuburbs(suburbIds);

    const siteIds = sites.reduce<IdExistsMap>((siteIds, site) => {
      if (site.geometry.type !== "Point")
        throw new Error("must be a point object");
      const sitePoint = points([
        [site.geometry.coordinates[0], site.geometry.coordinates[1]],
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
      if (!suburb.geometry) return <></>;
      return (
        <GeoJSON
          key={`suburb-${suburb.id}`}
          data={suburb.geometry}
          style={{ color }}
          pathOptions={{
            stroke: false,
            fillOpacity: 0.4,
          }}
        />
      );
    });
    return <>{suburbGeo}</>;
  }, [suburbs, selectedSuburbs]);
  const airSitesMemo = useMemo(() => {
    const sitesElms = sites.map((site) => {
      const siteInRect = selectedAirQualitySites[site.id];
      if (site.geometry.type !== "Point") return;
      return (
        <CircleMarker
          key={`site-${site.id}`}
          center={[site.geometry.coordinates[1], site.geometry.coordinates[0]]}
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
      className={styles.siteAndBoundariesMap}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapControls setRectangle={setRectangle} />
      <div className={styles.statusesIndicator}>
        <h2>Fetch Status</h2>
        {Object.keys(fetchStatuses).map((status) => (
          <div key={status} className={styles.status}>
            <span>{status}</span>
            <span>{fetchStatuses[status] ? "fetching" : "loaded"}</span>
          </div>
        ))}
      </div>
      {suburbsMemo}
      {airSitesMemo}
    </MapContainer>
  );
};
