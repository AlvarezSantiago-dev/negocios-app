//logica de configuracion dotenv
import { config } from "dotenv";
import argsUtil from "./args.util.js";

const { env } = argsUtil; //me traigo el ambiente
const path = env === "prod" ? "./.env.prod" : "./.env.dev"; // envaluo si es env es dev o prod para configurar la ruta.
config({ path });
const environment = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  SECRET_COOKIE: process.env.SECRET_COOKIE,
  SECRET_SESSION: process.env.SECRET_SESSION,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  SECRET_JWT: process.env.SECRET_JWT,
  GOOGLE_EMAIL: process.env.GOOGLE_EMAIL,
  GOOGLE_PASSWORD: process.env.GOOGLE_PASSWORD,
};
export default environment;
