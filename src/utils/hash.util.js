import { genSaltSync, hashSync, compareSync } from "bcrypt";

function createHash(contraseña) {
  const salt = genSaltSync(10); //medida estandar.. es exponencial el crecimiento del numero
  const hashPassword = hashSync(contraseña, salt);
  return hashPassword;
}

function verifyHash(reqPass, dbPass) {
  const isValid = compareSync(reqPass, dbPass);
  return isValid;
}

export { createHash, verifyHash };
