import { getAirQualitySites } from "../requests/airQuality";
import {
  getSearchParams,
  getSuburbsByPosition,
} from "../requests/trafficIncident";
import { getTrafficVolumeSites } from "../requests/trafficVolume";
import {
  airQualitySiteState,
  allSuburbState,
  trafficVolumeSitesState,
} from "../state/global";
import { GeoDataPolygon } from "../types/apiResponseTypes";

export const updateSuburbs = async () => {
  if (Object.keys(allSuburbState.get()).length !== 0) return;
  const { longitude, latitude, radius } = await getSearchParams();
  const suburbs = (await getSuburbsByPosition({
    longitude,
    latitude,
    radius,
  })) as GeoDataPolygon[];
  allSuburbState.set(suburbs);
};

export const updateTrafficVolumeSites = async () => {
  if (trafficVolumeSitesState.get().length !== 0) return;
  const sites = await getTrafficVolumeSites();
  trafficVolumeSitesState.set(sites);
};

export const updateAirQualitySites = async () => {
  if (airQualitySiteState.get().length !== 0) return;
  const sites = await getAirQualitySites();
  airQualitySiteState.set(sites);
};
