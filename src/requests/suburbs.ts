import { Suburb, EmissionsBySuburb, ApiSuburb } from "../types";
const { VITE_SERVER_URL } = import.meta.env;

export const getSuburbs = async (suburbIds: number[]) => {
  const res = await fetch(
    `${VITE_SERVER_URL}/suburbs?${suburbIds
      .map((id) => `suburbIds[]=${id}`)
      .join("&")}`
  );
  return (await res.json()) as Suburb[];
};

export const getYearlyEmissionsBySuburb = async (categories: number[]) => {
  const categoriesString = `[${categories.join(",")}]`;
  const res = await fetch(
    `${VITE_SERVER_URL}/suburbs/emissions/yearly?categories=${categoriesString}`
  );
  return (await res.json()) as EmissionsBySuburb;
};

export const getSuburbsForApi = async (apiId: number) => {
  const res = await fetch(`${VITE_SERVER_URL}/suburbs/api/${apiId}`);
  return (await res.json()) as ApiSuburb[];
};

export const getAllSuburbs = async () => {
  const res = await fetch(`${VITE_SERVER_URL}/suburbs/all`);
  return (await res.json()) as Suburb[];
};

export const getSuburbsByPosition = async (
  longitude: number,
  latitude: number,
  radius: number
) => {
  const res = await fetch(
    `${VITE_SERVER_URL}/suburbs/byposition?longitude=${longitude}&latitude=${latitude}&radius=${radius}`
  );
  return (await res.json()) as Suburb[];
};
