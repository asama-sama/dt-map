import intersect from "@turf/intersect";
import { points } from "@turf/helpers";
import pointsWithinPolygon from "@turf/points-within-polygon";

import { Rectangle } from "../types/geography";
import { polygonFromRectangle } from ".";
import {
  GeoData,
  GeoDataPoint,
  GeoDataPolygon,
} from "../types/apiResponseTypes";
import { IdExistsMap } from "../types";

const getSelectedPoints = (
  selection: Rectangle,
  geoDataPoints: GeoDataPoint[]
) => {
  const rect = polygonFromRectangle(selection);

  const pointIds = geoDataPoints.reduce<IdExistsMap>(
    (selectedIds, geoDataPoint) => {
      const sitePoint = points([
        [
          geoDataPoint.geometry.coordinates[0],
          geoDataPoint.geometry.coordinates[1],
        ],
      ]);
      const pointsWithin = pointsWithinPolygon(sitePoint, rect);
      if (pointsWithin.features.length > 0) {
        const newSelectedIds = { ...selectedIds };
        newSelectedIds[geoDataPoint.id] = true;
        return newSelectedIds;
      }
      return selectedIds;
    },
    {}
  );

  return pointIds;
};

const getSelectedPolygons = (
  selection: Rectangle,
  polygons: GeoDataPolygon[]
): IdExistsMap => {
  const rect = polygonFromRectangle(selection);
  const suburbIds = polygons.reduce<IdExistsMap>((ids, geoDataPolygon) => {
    const intersection =
      geoDataPolygon.geometry && intersect(geoDataPolygon.geometry, rect);
    if (intersection) {
      const newIds: IdExistsMap = { ...suburbIds };
      newIds[geoDataPolygon.id] = true;
      return newIds;
    }
    return ids;
  }, {});
  return suburbIds;
};

export const getGeoType = (geoDatas: GeoData[]): "Point" | "Polygon" | "" => {
  const type = geoDatas.reduce((acc, geoData) => {
    if (!acc) return geoData.geometry.type;
    if (acc === geoData.geometry.type) return acc;
    throw new Error("Type mismatch");
  }, "");
  if (type !== "Point" && type !== "Polygon") {
    return "";
  }
  return type;
};

export const getSelectedGeometries = (
  selection: Rectangle,
  geoData: GeoData[]
): IdExistsMap => {
  let selected: IdExistsMap = {};
  const geoType = getGeoType(geoData);
  if (geoType === "Point") {
    const geoDataPoints = geoData as GeoDataPoint[];
    selected = getSelectedPoints(selection, geoDataPoints);
  } else if (geoType === "Polygon") {
    const geoDataPolygons = geoData as GeoDataPolygon[];
    selected = getSelectedPolygons(selection, geoDataPolygons);
  }
  return selected;
};
