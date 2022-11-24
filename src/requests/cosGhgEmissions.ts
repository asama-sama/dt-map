const { VITE_SERVER_URL } = import.meta.env;

export type SuburbResponseValue = {
  value: number;
  suburbId: number;
};

export const getEmissionsBySuburb = async (
  categories: number[],
  year: number | undefined,
  order: string
) => {
  let queryStr = "";
  const categoriesString = categories
    .map((category) => `categories[]=${category}`)
    .join("&");
  queryStr += categoriesString + "&";

  if (year) {
    queryStr += `year=${year}&`;
  }
  if (order) {
    queryStr += `order=${order}`;
  }
  const res = await fetch(
    `${VITE_SERVER_URL}/cosghgemissions/suburb?${queryStr}`
  );
  return (await res.json()) as SuburbResponseValue[];
};

export const getYears = async () => {
  const res = await fetch(`${VITE_SERVER_URL}/cosghgemissions/years`);
  return (await res.json()) as number[];
};

export type CosGhgEmissionCategory = {
  id: number;
  name: string;
};

export const getCategories = async () => {
  const res = await fetch(`${VITE_SERVER_URL}/cosghgemissions/categories`);
  return (await res.json()) as CosGhgEmissionCategory[];
};
