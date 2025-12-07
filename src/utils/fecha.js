// src/utils/fecha.js
export const hoyArg = () => {
  const ahoraAR = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
    })
  );
  return ahoraAR.toISOString().slice(0, 10); // YYYY-MM-DD
};

export const fechaCompletaArg = () => {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
    })
  );
};
