import { DatewiseCategorySums } from "../types/apiResponseTypes";
import { dateToString } from "../util";

const { VITE_SERVER_URL } = import.meta.env;

export const getTrafficIncidentsForPosition = async (
  lat: number,
  lng: number,
  startDate: Date,
  endDate: Date,
  radius: number
) => {
  const startDateString = dateToString(startDate);
  const endDateString = dateToString(endDate);
  const res = await fetch(
    `${VITE_SERVER_URL}/trafficincidents/?lat=${lat}&lng=${lng}&radius=${radius}&startDate=${startDateString}&endDate=${endDateString}`
  );
  return (await res.json()) as DatewiseCategorySums;
};
