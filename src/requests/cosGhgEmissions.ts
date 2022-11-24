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
    .map((category) => `category[]=${category}`)
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
