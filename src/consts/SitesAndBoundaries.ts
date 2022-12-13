import {
  getAirQualityReadingsBySites,
  getAirQualitySites,
} from "../requests/airQuality";
import {
  getSuburbsByPosition,
  getTrafficIncidentsForSuburbs,
} from "../requests/trafficIncident";
import {
  getTrafficVolumeReadings,
  getTrafficVolumeSites,
} from "../requests/trafficVolume";
import { TemporalAggregate } from "../types";
import { DatewiseCategorySums, GeoData } from "../types/apiResponseTypes";

type PreRouteArgs = {
  longitude?: number;
  latitude?: number;
  radius?: number;
};

export type PreRouteDefinition = ({
  longitude,
  latitude,
  radius,
}: PreRouteArgs) => Promise<GeoData[]>;

type Routes = {
  pre: PreRouteDefinition;
  data: (
    ids: number[],
    startDate: Date,
    endDate: Date,
    aggregation: TemporalAggregate
  ) => Promise<DatewiseCategorySums>;
};

type Apis = {
  [key: string]: Routes;
};

export const apis: Apis = {
  trafficVolume: {
    pre: getTrafficVolumeSites,
    data: getTrafficVolumeReadings,
  },
  trafficIncidents: {
    pre: getSuburbsByPosition,
    data: getTrafficIncidentsForSuburbs,
  },
  airQuality: {
    pre: getAirQualitySites,
    data: getAirQualityReadingsBySites,
  },
};
