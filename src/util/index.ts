export type NonNormalisedData<T> = T & {
  reading: number;
};

export type NormalisedData<T> = T &
  NonNormalisedData<T> & {
    readingNormalised: number;
  };

export const applyRange = <T>(
  samples: NonNormalisedData<T>[]
): NormalisedData<T>[] => {
  let min = 999e5;
  let max = 0;
  samples.forEach((suburb) => {
    const { reading } = suburb;
    if (reading < min) min = reading;
    if (reading > max) max = reading;
  });
  const samplesNormalised: NormalisedData<T>[] = samples.map((sample) => {
    return {
      ...sample,
      readingNormalised: (sample.reading - min) / (max - min),
    };
  });
  return samplesNormalised;
};
