import { SuburbAggregateEmission } from "../types";
import { applyRange } from "./";

describe("utils", () => {
  const values = [4, 23, 44, 250, 100];
  const expectedValues = [0, 0.077236, 0.1626, 1, 0.3902];

  test("applyRange", () => {
    let emissions: SuburbAggregateEmission[] = [];

    emissions = values.map((value) => ({
      reading: value,
      id: 1,
      name: "",
      geoData: {},
      shapeArea: 0,
      shapeLength: 0,
    }));
    const results = applyRange(emissions);
    results.forEach((result, i) => {
      expect(result.readingRanged).toBeCloseTo(expectedValues[i]);
    });
  });
});
