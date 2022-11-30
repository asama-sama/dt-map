export type Point = {
  crs: { type: string; properties: { name: string } };
  type: "Point";
  coordinates: number[];
};
