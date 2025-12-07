import { genSaltSync, hashSync, compareSync } from "bcrypt";

function createHash(password) {
  const salt = genSaltSync(10); //medida estandar.. es exponencial el crecimiento del numero
  const hashPassword = hashSync(password, salt);
  return hashPassword;
}

function verifyHash(reqPass, dbPass) {
  const isValid = compareSync(reqPass, dbPass);
  return isValid;
}

export { createHash, verifyHash };
