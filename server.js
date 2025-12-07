import environment from "./src/utils/env.util.js";

import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { engine } from "express-handlebars";
import session from "express-session";
import path from "path";
import errorHandler from "./src/middleware/errorHandler.mid.js";
import panthHandler from "./src/middleware/pathHandler.mid.js";
import indexRouter from "./src/routers/index.router.js";
import compression from "express-compression";
import winston from "./src/middleware/winston.mid.js";
import __dirname from "./utils.js";

const server = express();
const port = process.env.PORT || environment.PORT || 8080; // Render asigna process.env.PORT

const ready = () => console.log("Server ready on port " + port);

// --- Cluster desactivado para Render Free Tier ---
server.listen(port, ready);

// --- Motor de vistas ---
server.engine("handlebars", engine());
server.set("view engine", "handlebars");
server.set("views", __dirname + "/src/views");
server.use(express.static(path.join(__dirname, "public")));

// --- Middlewares ---
server.use(
  session({
    store: new MongoStore({
      mongoUrl: environment.MONGO_URI,
      ttl: 60 * 60,
    }),
    secret: environment.SECRET_SESSION,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true, // OBLIGATORIO en producción con HTTPS (Vercel)
      sameSite: "none", // OBLIGATORIO para cross-site cookies
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser(environment.SECRET_JWT));
server.use(winston);
server.use(
  cors({
    origin:
      "https://negocios-app-frontend-git-main-alvarezsantiagodevs-projects.vercel.app",
    credentials: true,
  })
);

server.use(
  compression({
    brotli: { enabled: true, zlib: {} },
  })
);

// --- Rutas ---
server.use("/", indexRouter);
server.use(errorHandler);
server.use(panthHandler);

console.log("Environment:", environment);
