export type DatewiseCategorySums = {
  [date: string]: {
    // date is yyyy-mm-dd
    [type: string]: number;
  };
};
