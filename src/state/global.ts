import { hookstate } from "@hookstate/core";
import { Suburb } from "../types";
import { DatewiseCategorySums, GeoData } from "../types/apiResponseTypes";

// Deprecate this suburb state in favour of all suburb state
type SuburbState = { [key: number]: Suburb };

export const globalSuburbState = hookstate<SuburbState>({});

type ApiData = {
  preData: GeoData[];
  data: DatewiseCategorySums;
};

type GlobalState = {
  [key: string]: ApiData;
};

export const globalState = hookstate<GlobalState>({
  trafficVolume: {
    preData: [],
    data: {},
  },
  trafficIncidents: {
    preData: [],
    data: {},
  },
  airQuality: {
    preData: [],
    data: {},
  },
});
