import { TemporalAggregate } from "../types";
import { DatewiseCategorySums } from "../types/apiResponseTypes";
import { dateToString } from "../util";

const { VITE_SERVER_URL } = import.meta.env;

export const getTrafficIncidentsForSuburbs = async (
  suburbIds: number[],
  startDate: Date,
  endDate: Date,
  aggregate: TemporalAggregate
) => {
  const startDateString = dateToString(startDate);
  const endDateString = dateToString(endDate);
  const suburbIdsString = "suburbIds[]=" + suburbIds.join("&suburbIds[]=");
  const res = await fetch(
    `${VITE_SERVER_URL}/trafficincidents/?${suburbIdsString}&startDate=${startDateString}&endDate=${endDateString}&aggregate=${aggregate}`
  );
  return (await res.json()) as DatewiseCategorySums;
};

export type TrafficSearchParams = {
  latitude: number;
  longitude: number;
  radius: number;
};
export const getSearchParams = async () => {
  const res = await fetch(`${VITE_SERVER_URL}/trafficincidents/searchparams`);
  return (await res.json()) as TrafficSearchParams;
};
