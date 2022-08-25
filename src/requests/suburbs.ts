import { Suburb, Emission, EmissionsBySuburb } from "../types";
const { VITE_SERVER_URL } = import.meta.env;

export const getSuburbs = async () => {
  const res = await fetch(`${VITE_SERVER_URL}/suburbs`);
  return (await res.json()) as Suburb[];
};

export const getEmissionsBySuburb = async (
  categories: number[],
  year: number | undefined,
  sort: string
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
  if (queryStr.length > 0) {
    queryStr += `&`;
  }
  queryStr += `sort=${sort}`;
  const res = await fetch(`${VITE_SERVER_URL}/suburbs/emissions?${queryStr}`);
  return (await res.json()) as Emission[];
};

export const getYearlyEmissionsBySuburb = async (categories: number[]) => {
  const categoriesString = `[${categories.join(",")}]`;
  const res = await fetch(
    `${VITE_SERVER_URL}/suburbs/emissions/yearly?categories=${categoriesString}`
  );
  return (await res.json()) as EmissionsBySuburb;
};
