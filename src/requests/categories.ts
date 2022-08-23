import { Category, Emission } from "../types";
const { VITE_SERVER_URL } = import.meta.env;

export const getCategories = async () => {
  const res = await fetch(`${VITE_SERVER_URL}/categories`);
  return (await res.json()) as Category[];
};

export const getEmissionsByCategory = async () => {
  const res = await fetch(`${VITE_SERVER_URL}/categories/emissions`);
  return (await res.json()) as Emission[];
};
