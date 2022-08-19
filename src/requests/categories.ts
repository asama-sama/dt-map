import { Category } from "../types";
const { VITE_SERVER_URL } = import.meta.env;

export const getCategories = async () => {
  const res = await fetch(`${VITE_SERVER_URL}/categories`);
  return (await res.json()) as Category[];
};
