import { Point, Polygon } from "./geography";

export type DatewiseCategorySums = {
  [date: string]: {
    // date is yyyy-mm-dd
    [type: string]: number;
  };
};

export type GeoData = {
  id: number; // database id of the entity
  geometry: Point | Polygon;
};

export interface GeoDataPolygon extends GeoData {
  geometry: Polygon;
}

export interface GeoDataPoint extends GeoData {
  geometry: Point;
}
