import { TemporalAggregate } from "../types";
import { DatewiseCategorySums } from "../types/apiResponseTypes";
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

export type AirQualitySite = {
  id: number;
  position: Point;
  suburb: string;
  region: string;
};

export const getAirQualitySites = async () => {
  const res = await fetch(`${VITE_SERVER_URL}/airquality/sites`);
  return (await res.json()) as AirQualitySite[];
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
