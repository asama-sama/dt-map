const { VITE_SERVER_URL } = import.meta.env;

export type AirQualityCategories =
  | "GOOD"
  | "FAIR"
  | "POOR"
  | "VERY POOR"
  | "EXTREMELY POOR"
  | null;

export type AirQuality = {
  siteId: number;
  value: number;
  date: string;
  month?: number;
  quality: AirQualityCategories;
};

export const getAirQualityMonthly = async (sites: number[]) => {
  const res = await fetch(
    `${VITE_SERVER_URL}/airquality/monthly?sites=${JSON.stringify(sites)}`
  );
  return (await res.json()) as AirQuality[];
};

export interface AirQualityDataLive extends AirQuality {
  hour: number;
  hourDescription: string;
}

export const getAirQualityLive = async (sites: number[]) => {
  const res = await fetch(
    `${VITE_SERVER_URL}/airquality/live?sites=${JSON.stringify(sites)}`
  );
  return (await res.json()) as AirQualityDataLive[];
};
