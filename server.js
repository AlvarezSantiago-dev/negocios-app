//import htpp from "http"; // traemos el modulo.
import environment from "./src/utils/env.util.js";

import cluster from "cluster";
import { cpus } from "os";

import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { engine } from "express-handlebars";
import session from "express-session";
//import morgan from "morgan";
import path from "path";
import errorHandler from "./src/middleware/errorHandler.mid.js";
import panthHandler from "./src/middleware/pathHandler.mid.js";
import indexRouter from "./src/routers/index.router.js";
import argsUtil from "./src/utils/args.util.js";
import __dirname from "./utils.js";
import compression from "express-compression";
import winston from "./src/middleware/winston.mid.js";

const server = express(); //traemos metodo llamado create server, requiere Router como parametro
const port = environment.PORT || argsUtil.p; //por lo genereal servidores andan entre el 8000 y 9000
//callback Ready para avisar que levantamos
const ready = async () => {
  console.log("server ready on port " + port); //ejecuta una funcion por seguridad await y assync
};

const numberOfProcess = cpus().length;
//para aplicar clusterizacon por MAQUINA/
if (cluster.isPrimary) {
  for (let i = 1; i <= numberOfProcess; i++) {
    cluster.fork();
  }
  console.log("Proceso primario");
} else {
  console.log("Proceso Worker" + process.pid);
  server.listen(port, ready);
}

//metodo LISTENEN para levantar el servidor.
//metodo .listen es de HTTP.
//motor de vistas instalacion 3 lineas necesarias para el funcionamniento de express handlebars.
server.engine("handlebars", engine());
server.set("view engine", "handlebars");
server.set("views", __dirname + "/src/views");
server.use(express.static(path.join(__dirname, "public"))); // ruta del public

//middleware
server.use(
  session({
    store: new MongoStore({
      mongoUrl: environment.MONGO_URI,
      ttl: 60 * 60,
    }),
    secret: environment.SECRET_SESSION, //clave secreta
    resave: true, // para inactividad por parte del usuario online
    saveUninitialized: true, // permite guardar session no iniciada
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, //duracion de la session
  })
); // ya tenemos una session con este middleware.

server.use(express.json());
server.use(express.urlencoded({ extended: true })); // LINEA Para interpretar mejor los datos.
server.use(express.static(__dirname + "/public")); //habilita el uso de la carpeta public
server.use(cookieParser(environment.SECRET_JWT)); //parsea las coockies con la clave de cookies
server.use(winston); // linea para usar morgan
server.use(cors({ origin: true, credentials: true })); //acepta origenes paara la comunicacion front/backend
server.use(
  compression({
    brotli: { enabled: true, zlib: {} },
  })
);

//router principal.

server.use("/", indexRouter); //leer todas las rutas 1 (respetar orden)
server.use(errorHandler); // middleware error 2
server.use(panthHandler); // middleware error ruta 3

//users api routes

console.log(argsUtil);
console.log(environment);
