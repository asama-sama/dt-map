import { State } from "@hookstate/core";
import {
  updateAirQualitySites,
  updateSuburbs,
  updateTrafficVolumeSites,
} from "../actions";
import { getAirQualityReadingsBySites } from "../requests/airQuality";
import { getTrafficIncidentsForSuburbs } from "../requests/trafficIncident";
import { getTrafficVolumeReadings } from "../requests/trafficVolume";
import {
  airQualitySiteState,
  allSuburbState,
  trafficVolumeSitesState,
} from "../state/global";
import { TemporalAggregate } from "../types";
import { DatewiseCategorySums, GeoData } from "../types/apiResponseTypes";

export type PreRouteDefinition = () => Promise<void>;

type RoutesAndData = {
  prefetch: PreRouteDefinition;
  datafetch: (
    ids: number[],
    startDate: Date,
    endDate: Date,
    aggregation: TemporalAggregate
  ) => Promise<DatewiseCategorySums>;
  preData: State<GeoData[], unknown>;
};

export type Apis = {
  [key: string]: RoutesAndData;
};

export const apis: Apis = {
  trafficVolume: {
    prefetch: updateTrafficVolumeSites,
    datafetch: getTrafficVolumeReadings,
    preData: trafficVolumeSitesState,
  },
  trafficIncidents: {
    prefetch: updateSuburbs,
    datafetch: getTrafficIncidentsForSuburbs,
    preData: allSuburbState,
  },
  airQuality: {
    prefetch: updateAirQualitySites,
    datafetch: getAirQualityReadingsBySites,
    preData: airQualitySiteState,
  },
};
