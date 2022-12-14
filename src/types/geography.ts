export type Point = {
  crs: { type: string; properties: { name: string } };
  type: "Point";
  coordinates: number[];
};

export type Polygon = {
  type: "Polygon";
  coordinates: number[][][];
};

export type LatLng = {
  lat: number;
  lng: number;
};

export type LatLngArray = [number, number];

export type Rectangle = [[number, number], [number, number]];
