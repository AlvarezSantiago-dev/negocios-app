import usersRepository from "../repositories/users.rep.js";
import crypto from "crypto";
import sendEmail from "../utils/mailing.util.js";
import { createHash } from "../utils/hash.util.js";
class SessionsController {
  async login(req, res, next) {
    try {
      return res
        .cookie("token", req.user.token, {
          signed: true, // ✅ esta es la clave
          httpOnly: true,
          sameSite: "none", // necesario para cross-site
          secure: true, // obligatorio si estás en HTTPS
          maxAge: 24 * 60 * 60 * 1000,
        })
        .exitoMensaje("Logged In");
    } catch (error) {
      return next(error);
    }
  }

  async online(req, res, next) {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ statusCode: 401, message: "Not logged in" });
      }

      return res.json({
        statusCode: 200,
        message: "Usuario autenticado",
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async googlecb(req, res, next) {
    try {
      return res.exitoMensaje("Login in with Google");
    } catch (error) {
      return next(error);
    }
  }

  async signeout(req, res, next) {
    try {
      if (req.user.online) {
        //metodo para destruir session
        return res.clearCookie("token").exitoMensaje("Signeout! ");
      } else {
        return res.json({
          statusCode: 401,
          message: "No existe ninguna session iniciada! ",
        });
      }
    } catch (error) {
      return next(error);
    }
  }

  async register(req, res, next) {
    try {
      return res.json({
        statusCode: 201,
        message: "Registered!",
      });
    } catch (error) {
      return next(error);
    }
  }

  async verify(req, res, next) {
    try {
      const { email, code } = req.body;
      const one = await usersRepository.readByEmailRepository(email);
      const verify = code === one.verifyCode;
      if (verify) {
        await usersRepository.updateRepository(one._id, { verify });
        return res.exitoMensaje("User verificado");
      } else {
        return res.error404();
      }
    } catch (error) {
      return next(error);
    }
  }
  async password(req, res, next) {
    try {
      const { email } = req.body;

      const user = await usersRepository.readByEmailRepository(email);
      if (!user) return res.error404("Email no encontrado");

      // generar código de recuperación
      const resetCode = crypto.randomBytes(5).toString("hex");

      // guardar el código
      await usersRepository.updateRepository(user._id, { resetCode });

      // enviar email
      await sendEmail({
        to: user.email,
        subject: "Recuperación de password",
        html: `
        <h1>Recuperación de password</h1>
        <p>Tu código de recuperación es: <strong>${resetCode}</strong></p>
      `,
      });

      return res.exitoMensaje("Código enviado al email");
    } catch (error) {
      next(error);
    }
  }
  async ressetpass(req, res, next) {
    try {
      const { email, code, newPassword } = req.body;

      const user = await usersRepository.readByEmailRepository(email);
      if (!user) return res.error404("Email no encontrado");

      if (!user.resetCode)
        return res.error400("No hay una solicitud activa de recuperación");

      if (user.resetCode !== code) return res.error401("Código incorrecto");

      const hashed = createHash(newPassword);

      await usersRepository.updateRepository(user._id, {
        password: hashed,
        resetCode: null,
      });

      return res.exitoMensaje("password restablecida exitosamente");
    } catch (error) {
      next(error);
    }
  }
}

const sessionsController = new SessionsController();
const {
  register,
  login,
  signeout,
  googlecb,
  online,
  verify,
  password,
  ressetpass,
} = sessionsController;
export {
  register,
  login,
  signeout,
  googlecb,
  online,
  verify,
  password,
  ressetpass,
};
