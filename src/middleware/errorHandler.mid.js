//middleware menejador de errores.
//todos los middleware dependen de req,res y next
//funcion next permite pasar.
//cadavez que ocurra un error se ejecuta
import winston from "../utils/winston.util.js";
function errorHandler(error, req, res, next) {
  const message = `${req.method}  ${
    req.url
  } - ${new Date().toLocaleTimeString()} -${error.message}`;
  winston.ERROR(message);
  res.json({
    statusCode: error.statusCode || 500,
    message: error.message || "Coder Api error",
  });
}
export default errorHandler;
