const { VITE_SERVER_URL } = import.meta.env;

export type Station = {
  station_key: string;
  station_id: string;
  name: string;
  road_name: string;
  road_name_base: string;
  common_road_name: string;
  road_on_type: string;
  lane_count: string;
  road_classification_type: string;
  road_classification_admin: string;
  rms_region: string;
  lga: string;
  suburb: string;
  post_code: string;
  longitude: number;
  latitude: number;
  secondary_name: string;
  full_name: string;
};

export const getStations = async () => {
  const res = await fetch(`${VITE_SERVER_URL}/trafficvolume/stations`);
  return (await res.json()) as { [key: string]: Station };
};

type TrafficCountResponse = {
  stationKey: string;
  count: number;
  month: number;
};
export interface TrafficCount extends TrafficCountResponse {
  countId: number;
}

export const getMonthlyCountsForYear = async (
  year: number,
  stationIds: number[]
) => {
  const res = await fetch(
    `${VITE_SERVER_URL}/trafficvolume/monthly?year=${year}&stationIds=${JSON.stringify(
      stationIds
    )}`
  );
  const countResponse = (await res.json()) as TrafficCount[];
  const counts: TrafficCount[] = countResponse.map((count, i) => ({
    ...count,
    countId: i,
  }));
  return counts;
};