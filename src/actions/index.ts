import {
  getAirQualityReadingsBySites,
  getAirQualitySites,
} from "../requests/airQuality";
import {
  getSearchParams,
  getSuburbsByPosition,
  getTrafficIncidentsForSuburbs,
} from "../requests/trafficIncident";
import {
  getTrafficVolumeReadings,
  getTrafficVolumeSites,
} from "../requests/trafficVolume";
import { globalState } from "../state/global";
import { TemporalAggregate } from "../types";
import { GeoDataPolygon } from "../types/apiResponseTypes";

// traffic incidents
export const updateSuburbs = async () => {
  if (
    Object.keys(globalState["trafficIncidents"]["preData"].get()).length !== 0
  )
    return;
  const { longitude, latitude, radius } = await getSearchParams();
  const suburbs = (await getSuburbsByPosition({
    longitude,
    latitude,
    radius,
  })) as GeoDataPolygon[];
  globalState["trafficIncidents"]["preData"].set(suburbs);
};

export const updateTrafficIncidents = async (
  ids: number[],
  startDate: Date,
  endDate: Date,
  aggregation: TemporalAggregate
) => {
  const trafficIncidents = await getTrafficIncidentsForSuburbs(
    ids,
    startDate,
    endDate,
    aggregation
  );
  globalState["trafficIncidents"]["data"].set(trafficIncidents);
};
//

// traffic volume
export const updateTrafficVolumeSites = async () => {
  if (globalState["trafficVolume"]["preData"].get().length !== 0) return;
  const sites = await getTrafficVolumeSites();
  globalState["trafficVolume"]["preData"].set(sites);
};

export const updateTrafficVolumeReadings = async (
  ids: number[],
  startDate: Date,
  endDate: Date,
  aggregation: TemporalAggregate
) => {
  const readings = await getTrafficVolumeReadings(
    ids,
    startDate,
    endDate,
    aggregation
  );
  globalState["trafficVolume"]["data"].set(readings);
};
//

// air quality
export const updateAirQualitySites = async () => {
  if (globalState["airQuality"]["preData"].get().length !== 0) return;
  const sites = await getAirQualitySites();
  globalState["airQuality"]["preData"].set(sites);
};

export const updateAirQualityReadings = async (
  ids: number[],
  startDate: Date,
  endDate: Date,
  aggregation: TemporalAggregate
) => {
  const readings = await getAirQualityReadingsBySites(
    ids,
    startDate,
    endDate,
    aggregation
  );
  globalState["airQuality"]["data"].set(readings);
};
//
