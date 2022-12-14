import {
  updateAirQualityReadings,
  updateAirQualitySites,
  updateSuburbs,
  updateTrafficIncidents,
  updateTrafficVolumeReadings,
  updateTrafficVolumeSites,
} from "../actions";

import { TemporalAggregate } from "../types";

export type PreRouteDefinition = () => Promise<void>;

export type MainDataFetchDefn = (
  ids: number[],
  startDate: Date,
  endDate: Date,
  aggregation: TemporalAggregate
) => Promise<void>;

type RoutesAndData = {
  prefetch: PreRouteDefinition;
  datafetch: MainDataFetchDefn;
};

export type Apis = {
  [key: string]: RoutesAndData;
};

export const apis: Apis = {
  trafficVolume: {
    prefetch: updateTrafficVolumeSites,
    datafetch: updateTrafficVolumeReadings,
  },
  trafficIncidents: {
    prefetch: updateSuburbs,
    datafetch: updateTrafficIncidents,
  },
  airQuality: {
    prefetch: updateAirQualitySites,
    datafetch: updateAirQualityReadings,
  },
};
