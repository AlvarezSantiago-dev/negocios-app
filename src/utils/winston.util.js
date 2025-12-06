import { createLogger, format, addColors, transports } from "winston";

const { colorize, simple } = format;
// para los colores

//Tipos de registros
const { Console, File } = transports;

const levels = { FATAL: 0, ERROR: 1, INFO: 2, HTTP: 3 };
const colors = { FATAL: "red", ERROR: "yellow", INFO: "blue", HTTP: "white" };
addColors(colors); // junta el array de levels por el orden con el array de clores

const logger = createLogger({
  levels,
  format: colorize(),
  transports: [
    new Console({ level: "HTTP", format: simple() }),
    new File({
      level: "ERROR",
      format: simple(),
      filename: "./src/utils/errors/errors.log",
    }),
  ],
});
export default logger;
