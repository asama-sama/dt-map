import { Emission } from "../types";
const { VITE_SERVER_URL } = import.meta.env;

export const getEmissions = async (
  categories: number[],
  year: number | undefined
) => {
  let queryStr = "";
  const categoriesString = `[${categories.join(",")}]`;
  queryStr += `categories=${categoriesString}`;
  if (categories && year) {
    queryStr += `&`;
  }
  if (year) {
    queryStr += `year=${year}`;
  }
  const res = await fetch(`${VITE_SERVER_URL}/emissions?${queryStr}`);
  return (await res.json()) as Emission[];
};

export const getYears = async () => {
  const res = await fetch(`${VITE_SERVER_URL}/emissions/years`);
  return (await res.json()) as number[];
};
