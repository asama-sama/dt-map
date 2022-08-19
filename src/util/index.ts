import { SuburbWithData } from "../types";

export const applyRange = (suburbs: SuburbWithData[]) => {
  let min = 999e5;
  let max = 0;
  suburbs.forEach((suburb) => {
    const { reading } = suburb;
    if (reading && reading < min) min = reading;
    if (reading && reading > max) max = reading;
  });
  const suburbAggregateEmissionRanged = suburbs.map((suburb) => {
    return {
      ...suburb,
      readingNormalised: suburb.reading && (suburb.reading - min) / (max - min),
    };
  });
  return suburbAggregateEmissionRanged;
};
