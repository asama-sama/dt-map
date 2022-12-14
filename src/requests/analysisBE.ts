const { VITE_ANALYSIS_BE_URL } = import.meta.env;

export type SimpleCorrelationResult = {
  "1-Pvalue": number;
  COLUMN1: string;
  COLUMN2: string;
  CORRELATION: number;
  DatasetPair: string;
  Pvalue: number;
  Score: number;
  comparisonType: number;
  numRows1: number;
  numRows2: number;
  num_Buckets: number;
  tGranularity: string;
  uniqVal12: number;
  uniqVals1: number;
};
type GetSimpleCorrelationSignature = (
  ds1: string, // key from API_CORRELATION_MAP
  ds2: string, // key from API_CORRELATION_MAP
  from: string, // yyyy-mm-dd
  to: string, // yyyy-mm-dd
  spatial: string //
) => Promise<SimpleCorrelationResult[]>;

export const getSimpleCorrelation: GetSimpleCorrelationSignature = async (
  ds1,
  ds2,
  from,
  to,
  spatial
) => {
  const res = await fetch(
    `${VITE_ANALYSIS_BE_URL}/simple_corr/?ds1=${ds1}&ds2=${ds2}&from=${from}&to=${to}&spatial=${spatial}`
  );
  const data = (await res.json()) as SimpleCorrelationResult[];
  return data;
};
