import passport from "passport";

function passportCb(strategy) {
  return (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (error, user, info) => {
      if (error) return next(error);

      if (user) {
        req.user = user; // guardamos el user para el siguiente handler
        return next();
      }

      // si no hay usuario -> usamos tu diccionario de respuestas
      return res.json({
        statusCode: info?.statusCode || 401,
        message: info?.message || "Authentication failed",
      });
    })(req, res, next);
  };
}

export default passportCb;
