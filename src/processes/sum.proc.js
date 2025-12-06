function sum() {
  let result = 0;
  for (let i = 0; i < 5e9; i++) {
    result += 1;
  }
  return result;
}
//esta suma maneja el proceso, desde el 0 hace una suma enorme

//el proceso secundario ejecuta la suma y le devuelve al proceso principal el resultado
process.on("on", () => {
  const result = sum();
  process.send(result);
});
