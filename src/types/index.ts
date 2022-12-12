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
  boundary?: {
    type: "Polygon";
    coordinates: number[][][];
  };
  position?: {
    type: "Point";
    coordinates: [];
  };
};

export interface SuburbWithMapData extends Suburb {
  description: string;
}

export type ApiSuburb = {
  id: number;
  meta: {
    siteId: number;
  };
};

// export type SuburbsIndexed = {
//   [key: number]: Suburb;
// };

export interface SuburbWithData extends Suburb {
  reading: number;
  readingNormalised: number;
}

export type Emission = {
  reading: number;

  year: number;

  suburbId: number;

  categoryId: number;
};

export type EmissionsBySuburb = {
  [key: number]: Emission[];
};

export type Input = {
  id: number;
  name: string;
};

export interface InputToggle extends Input {
  on: boolean;
}

export type Api = {
  id: number;
  name: string;
};

export type TemporalAggregate = "day" | "month" | "year";

export type IdExistsMap = { [key: number]: boolean };

export type DateRange = {
  startDate: string;
  endDate: string;
};
