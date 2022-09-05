import { Api } from "../types";
const { VITE_SERVER_URL } = import.meta.env;

export const getApis = async () => {
  const res = await fetch(`${VITE_SERVER_URL}/apis`);
  return (await res.json()) as Api[];
};
