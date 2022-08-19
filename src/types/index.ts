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

export type SuburbsIndexed = {
  [key: number]: Suburb;
};

export interface SuburbWithData extends Suburb {
  reading?: number;
  readingNormalised?: number;
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

export type YearSuburbMap = {
  [key: string]: Emission[];
};
