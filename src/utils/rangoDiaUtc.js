function rangoDiaUTC(year, month, day) {
  // Argentina UTC-3
  const inicio = new Date(Date.UTC(year, month - 1, day, 3, 0, 0, 0));
  const fin = new Date(Date.UTC(year, month - 1, day + 1, 2, 59, 59, 999));
  return { inicio, fin };
}
export default rangoDiaUTC;
