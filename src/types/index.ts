export type GeoJson = {
  type:
    | "Point"
    | "MultiPoint"
    | "LineString"
    | "MultiLineString"
    | "Polygon"
    | "MultiPolygon"
    | "GeometryCollection"
    | "Feature"
    | "FeatureCollection";
  coordinates: number[][][];
};

export type SuburbJson = {
  [key: string]: {
    place_id: number;
    boundingbox: string[];
    lat: string;
    lon: string;
    geojson: GeoJson;
  };
};

export type Suburb = {
  id: number;
  name: string;
  shapeArea: number;
  shapeLength: number;
  geoData: SuburbJson;
};

export interface SuburbAggregateEmissions extends Suburb {
  reading?: number;
}

export type Emission = {
  reading: number;

  year: number;

  suburbId: number;

  categoryId: number;
};

export interface EmissionsAggregate extends Emission {
  suburbId: number;
  suburbAggregateEmission: number;
}
