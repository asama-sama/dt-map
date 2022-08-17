const { SERVER_URL } = import.meta.env;

export const getEmissions = async () => {
  const res = await fetch(`http://localhost:3000/emissions`);
  return res.json();
};
