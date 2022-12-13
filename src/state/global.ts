import { hookstate } from "@hookstate/core";
import { Suburb } from "../types";
import { DatewiseCategorySums, GeoData } from "../types/apiResponseTypes";

// Deprecate this suburb state in favour of all suburb state
type SuburbState = { [key: number]: Suburb };

export const globalSuburbState = hookstate<SuburbState>({});

type ApiData = {
  pre: GeoData[];
  data: DatewiseCategorySums;
};

// all suburb state
const globalState = hookstate<{ [key: string]: ApiData }>({
  trafficVolume: {
    pre: [],
    data: {},
  },
  trafficIncidents: {
    pre: [],
    data: {},
  },
  airQuality: {
    pre: [],
    data: {},
  },
});
export const allSuburbState = hookstate<GeoData[]>([]);

export const trafficVolumeSitesState = hookstate<GeoData[]>([]);

export const airQualitySiteState = hookstate<GeoData[]>([]);
