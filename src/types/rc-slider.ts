export type Marks = { [key: number]: { style?: object; label: string } };
export type SliderProps = {
  min: number;
  max?: number;
  marks: Marks;
  defaultValue?: [number, number];
};
