//middleware ruta
function panthHandler(req, res, next) {
  return res.json({
    statusCode: 404,
    message: `${req.method} ${req.url} not found path`, // linea ya definida
  });
}
export default panthHandler;
