import { TemporalAggregate } from "../types";
import { DatewiseCategorySums, GeoDataPoint } from "../types/apiResponseTypes";
import { Point } from "../types/geography";
import { dateToString } from "../util";

const { VITE_SERVER_URL } = import.meta.env;

export type AirQualityCategories =
  | "GOOD"
  | "FAIR"
  | "POOR"
  | "VERY POOR"
  | "EXTREMELY POOR"
  | null;

export type AirQuality = {
  siteId: number;
  value: number;
  date: string;
  month?: number;
  quality: AirQualityCategories;
};

export const getAirQualityMonthly = async (sites: number[]) => {
  const res = await fetch(
    `${VITE_SERVER_URL}/airquality/monthly?sites=${JSON.stringify(sites)}`
  );
  return (await res.json()) as AirQuality[];
};

export const getAirQualitySites = async () => {
  const res = await fetch(`${VITE_SERVER_URL}/airquality/pre`);
  const geoData = (await res.json()) as GeoDataPoint[];
  for (const data of geoData) {
    data.geometry as Point;
  }
  return geoData;
};

export const getAirQualityReadingsBySites = async (
  siteIds: number[],
  startDate: Date,
  endDate: Date,
  aggregate: TemporalAggregate
) => {
  const airQualitySiteIdsString =
    "airQualitySiteIds[]=" + siteIds.join("&airQualitySiteIds[]=");
  const startDateString = dateToString(startDate);
  const endDateString = dateToString(endDate);
  const res = await fetch(
    `${VITE_SERVER_URL}/airquality/?${airQualitySiteIdsString}&startDate=${startDateString}&endDate=${endDateString}&aggregate=${aggregate}`
  );
  return (await res.json()) as DatewiseCategorySums;
};
