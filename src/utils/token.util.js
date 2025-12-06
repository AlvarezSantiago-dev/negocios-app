import jwt from "jsonwebtoken";
import environment from "./env.util.js";
const createToken = (data) => {
  const opts = { expiresIn: 60 * 60 };
  const token = jwt.sign(data, environment.SECRET_JWT, opts);
  return token;
};
const verifyToken = (token) => {
  const data = jwt.verify(token, environment.SECRET_JWT); //LA MISMA DE LA ESTRATEGIA DE JWT
  console.log("Decoded token data:", data);
  return data;
};

export { createToken, verifyToken };
