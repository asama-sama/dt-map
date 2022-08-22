const { VITE_SERVER_URL } = import.meta.env;

export const getYears = async () => {
  const res = await fetch(`${VITE_SERVER_URL}/emissions/years`);
  return (await res.json()) as number[];
};
