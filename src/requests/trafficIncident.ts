import { DatewiseCategorySums } from "../types/apiResponseTypes";
import { dateToString } from "../util";

const { VITE_SERVER_URL } = import.meta.env;

export const getTrafficIncidentsForSuburbs = async (
  suburbIds: number[],
  startDate: Date,
  endDate: Date
) => {
  const startDateString = dateToString(startDate);
  const endDateString = dateToString(endDate);
  const suburbIdsString = "suburbIds[]=" + suburbIds.join("&suburbIds[]=");
  const res = await fetch(
    `${VITE_SERVER_URL}/trafficincidents/?${suburbIdsString}&startDate=${startDateString}&endDate=${endDateString}`
  );
  return (await res.json()) as DatewiseCategorySums;
};
