import { Router } from "express";
import usersRepository from "../repositories/users.rep.js";
import { verifyToken } from "../utils/token.util.js";
class CustomRouter {
  constructor() {
    this.router = Router();
    this.init();
  } // para construir y configurar cada instancia del enrutador
  getRouter() {
    return this.router;
  } // obtener todas las rutas del enrutador definido
  init() {} //para inicializar las clases/propiedades eredades para cuando tengamos subsRouters
  applyCbs(callbacks) {
    return callbacks.map((callbacks) => async (...params) => {
      try {
        await callbacks.apply(this, params);
      } catch (error) {
        return params[2](error);
      }
    });
  } //majear las cbs de middlewares y la cbFINAL.

  //DICCIONARIO DE RESPUESTAS
  response = (req, res, next) => {
    res.exitoMensaje = (message) => res.json({ statusCode: 200, message });
    res.exito200 = (response) => res.json({ statusCode: 200, response });
    res.exito201 = (response) => res.json({ statusCode: 201, response });
    res.error400 = (message) => res.json({ statusCode: 400, message });
    res.error401 = () =>
      res.json({ statusCode: 401, message: "Bad Auth! from policies" }); //cambiar
    res.error403 = () => res.json({ statusCode: 403, message: "Forbidden" });
    res.error404 = () => res.json({ statusCode: 404, message: "Not Found" });
    res.paginate = (response, info) =>
      res.json({ statusCode: 200, response, info });

    return next();
  };

  //Policies //POLITICAS DE SEGURIDAD PARA LOS ENDPOINTS.
  policies = (policies) => async (req, res, next) => {
    if (policies.includes("PUBLIC")) return next();
    else {
      let token = req.signedCookies["token"];
      if (!token) return res.error401();
      try {
        token = verifyToken(token);
        const { role, email, online } = token;
        if (
          (policies.includes("USER") && role === 0) ||
          (policies.includes("ADMIN") && role === 1)
        ) {
          const user = await usersRepository.readByEmailRepository(email);
          req.user = {
            user_id: user._id,
            email: user.email,
            role: user.role,
            picture: user.picture,
            online: online ?? false, // del token
          };

          return next();
        } else {
          return res.error403();
        }
      } catch (error) {
        return res.error400(error);
      }
    }
  };

  create(path, arrayOfPolicies, ...callbacks) {
    this.router.post(
      path,
      this.response,
      this.policies(arrayOfPolicies),
      this.applyCbs(callbacks)
    );
  }
  read(path, arrayOfPolicies, ...callbacks) {
    this.router.get(
      path,
      this.response,
      this.policies(arrayOfPolicies),
      this.applyCbs(callbacks)
    );
  }
  update(path, arrayOfPolicies, ...callbacks) {
    this.router.put(
      path,
      this.response,
      this.policies(arrayOfPolicies),
      this.applyCbs(callbacks)
    );
  }
  destroy(path, arrayOfPolicies, ...callbacks) {
    this.router.delete(
      path,
      this.response,
      this.policies(arrayOfPolicies),
      this.applyCbs(callbacks)
    );
  }
  use(path, ...callbacks) {
    this.router.use(path, this.response, this.applyCbs(callbacks));
  }
}

export default CustomRouter;
