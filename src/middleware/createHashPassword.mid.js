import { createHash } from "../utils/hash.util.js";

function createHashPassword(req, res, next) {
  try {
    const { password } = req.body; //me la mandan
    const hashPassword = createHash(password);
    req.body.password = hashPassword; //reasignarle el valor
    return next();
  } catch (error) {
    return next(error);
  }
}

export default createHashPassword;
