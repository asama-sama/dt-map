import Color from "colorjs.io";

const color = new Color("p3", [0, 1, 0]);
const redgreen = color.range("red", {
  space: "lch", // interpolation space
  outputSpace: "srgb",
});

export const colorSuburb = (value: number | undefined) => {
  return redgreen(value);
};
