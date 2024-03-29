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

import styles from "./SitesAndBoundariesMap.module.css";
import {
  GeoData,
  GeoDataPoint,
  GeoDataPolygon,
} from "../../types/apiResponseTypes";
import { getGeoType, getSelectedGeometries } from "../../util/geometry";

type SetRectangleFn = (rectangle: RectangleData | undefined) => void;
type MapControlsProps = {
  currentRectangle: RectangleData | undefined;
  setCurrentRectangle: (currentRectangle: RectangleData | undefined) => void;
  setRectangle: SetRectangleFn;
};

const MapControls = ({
  currentRectangle,
  setCurrentRectangle,
  setRectangle,
}: MapControlsProps) => {
  const [point1, setPoint1] = useState<LatLngArray>();
  const [drawRectangle, setDrawRectangle] = useState(false);
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
      {currentRectangle && (
        <Rectangle bounds={currentRectangle} pathOptions={{ color: "lime" }} />
      )}
    </>
  );
};

const selection1Color = "rgb(15, 192, 192)";
const selection2Color = "rgb(150, 10, 10)";

const PointMarkers = ({
  geoData,
  selectedIds,
  selection,
}: {
  geoData: GeoDataPoint[];
  selectedIds: IdExistsMap;
  selection: 1 | 2;
}) => {
  type SelectionColors = {
    unselected: string;
    selected: string;
  };
  const selection1Colors: SelectionColors = {
    unselected: selection1Color,
    selected: "#2dffe6",
  };

  const selection2Colors: SelectionColors = {
    unselected: selection2Color, //#00735f
    selected: "#ff8181",
  };
  let selectionColors: SelectionColors;
  if (selection === 1) {
    selectionColors = selection1Colors;
  } else {
    selectionColors = selection2Colors;
  }

  const mapElements = geoData.map((geoData) => {
    const idInRect = selectedIds[geoData.id];
    return (
      <CircleMarker
        key={`site-${geoData.id}`}
        center={[
          geoData.geometry.coordinates[1],
          geoData.geometry.coordinates[0],
        ]}
        radius={3}
        pathOptions={{
          color: idInRect
            ? selectionColors.selected
            : selectionColors.unselected,
          fillColor: idInRect
            ? selectionColors.selected
            : selectionColors.unselected,
          fillOpacity: 1,
        }}
        pane={"markerPane"}
      ></CircleMarker>
    );
  });
  return <>{mapElements}</>;
};

const PolygonBoundaries = ({
  geoData,
  selectedIds,
  selection,
}: {
  geoData: GeoDataPolygon[];
  selectedIds: IdExistsMap;
  selection: 1 | 2;
}) => {
  const suburbGeo = geoData.map((geoDataPolygon) => {
    let color = `#a6a6a6`;
    if (selectedIds[geoDataPolygon.id]) {
      if (selection === 1) {
        color = selection1Color;
      } else {
        color = selection2Color;
        // color = "#ffed32";
      }
    }
    if (!geoDataPolygon.geometry) return <></>;
    return (
      <GeoJSON
        key={`suburb-${geoDataPolygon.id}`}
        data={geoDataPolygon.geometry}
        style={{ color }}
        pathOptions={{
          stroke: false,
          fillOpacity: 0.4,
        }}
      />
    );
  });
  return <>{suburbGeo}</>;
};

const mapElementForType = (
  geoData: GeoData[],
  selectedIds: IdExistsMap,
  selection: 1 | 2
) => {
  const type = getGeoType(geoData);
  if (type === "Point") {
    const geoDataPoints = geoData as GeoDataPoint[];
    return (
      <PointMarkers
        geoData={geoDataPoints}
        selectedIds={selectedIds}
        selection={selection}
      />
    );
  } else if (type === "Polygon") {
    const geoDataPolygons = geoData as GeoDataPolygon[];
    return (
      <PolygonBoundaries
        geoData={geoDataPolygons}
        selectedIds={selectedIds}
        selection={selection}
      />
    );
  }
};

export const SitesAndBoundariesMap = ({
  dataSource1PreData,
  dataSource2PreData,
  selectedDs2PreIds,
  selectedDs1PreIds,
  selectedRectangle,
  setSelectedDs2PreIds,
  setSelectedDs1PreIds,
  setSelectedRectangle,
  currentRectangle,
  setCurrentRectangle,
}: {
  dataSource1PreData: GeoData[];
  dataSource2PreData: GeoData[];
  selectedDs2PreIds: IdExistsMap;
  selectedDs1PreIds: IdExistsMap;
  selectedRectangle: RectangleData | undefined;
  currentRectangle: RectangleData | undefined;
  setSelectedDs2PreIds: (suburbs: IdExistsMap) => void;
  setSelectedDs1PreIds: (sites: IdExistsMap) => void;
  setSelectedRectangle: (rectangle: RectangleData | undefined) => void;
  setCurrentRectangle: (currentRectangle: RectangleData | undefined) => void;
}) => {
  // const [rectangle, setRectangle] = useState<RectangleData>();

  useEffect(() => {
    if (!selectedRectangle) {
      setSelectedDs1PreIds({});
      setSelectedDs2PreIds({});
      return;
    }

    // setSelectedRectangle(selectedRectangle);

    const selectedDs2PreIds = getSelectedGeometries(
      selectedRectangle,
      dataSource2PreData
    );
    setSelectedDs2PreIds(selectedDs2PreIds);

    const selectedSites = getSelectedGeometries(
      selectedRectangle,
      dataSource1PreData
    );
    setSelectedDs1PreIds(selectedSites);
  }, [selectedRectangle]);

  const ds1ElementsMemo = useMemo(() => {
    if (!selectedDs1PreIds) return <></>;
    return mapElementForType(dataSource1PreData, selectedDs1PreIds, 1);
  }, [dataSource1PreData, selectedDs1PreIds]);
  const ds2ElementsMemo = useMemo(() => {
    return mapElementForType(dataSource2PreData, selectedDs2PreIds, 2);
  }, [dataSource2PreData, selectedDs2PreIds]);

  return (
    <MapContainer
      center={[-33.879, 151.1]}
      zoom={11}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", position: "absolute" }}
      className={styles.siteAndBoundariesMap}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapControls
        setRectangle={setSelectedRectangle}
        currentRectangle={currentRectangle}
        setCurrentRectangle={setCurrentRectangle}
      />
      {ds2ElementsMemo}
      {ds1ElementsMemo}
    </MapContainer>
  );
};
