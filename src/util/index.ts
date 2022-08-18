import { SuburbAggregateEmission } from "../types";
import { SuburbAggregateEmissionRanged } from "../types";

export const applyRange = (suburbs: SuburbAggregateEmission[]) => {
  let min = 999e5;
  let max = 0;
  suburbs.forEach((suburb) => {
    const { reading } = suburb;
    if (reading && reading < min) min = reading;
    if (reading && reading > max) max = reading;
  });
  const suburbAggregateEmissionRanged: SuburbAggregateEmissionRanged[] =
    suburbs.map((suburb) => {
      return {
        ...suburb,
        readingRanged: suburb.reading && (suburb.reading - min) / (max - min),
      };
    });
  return suburbAggregateEmissionRanged;
};
