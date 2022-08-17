import { Suburb, Emission } from "../types";
const { VITE_SERVER_URL } = import.meta.env;

type GetEmissionsResponse = {
  suburbs: Suburb[];
  emissions: Emission[];
};

export const getEmissions = async () => {
  const res = await fetch(`${VITE_SERVER_URL}/emissions`);
  return (await res.json()) as GetEmissionsResponse;
};
