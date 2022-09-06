const { VITE_SERVER_URL } = import.meta.env;

export type AirQuality = {
  date: string;
  month: number;
  siteId: number;
  value: number;
};

export const getAirQuality = async (sites: number[]) => {
  const res = await fetch(
    `${VITE_SERVER_URL}/airquality?sites=${JSON.stringify(sites)}`
  );
  return (await res.json()) as AirQuality[];
};
