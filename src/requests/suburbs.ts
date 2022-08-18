import { Suburb } from "../types";
const { VITE_SERVER_URL } = import.meta.env;

export const getSuburbs = async () => {
  const res = await fetch(`${VITE_SERVER_URL}/suburbs`);
  return (await res.json()) as Suburb[];
};
