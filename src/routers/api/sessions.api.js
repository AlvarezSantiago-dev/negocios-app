import passport from "../../middleware/passport.mid.js";
import passportCb from "../../middleware/passportCb.mid.js";
import CustomRouter from "../CustomRouter.js";
// por lo general son peticiones de tipo post.
import {
  register,
  login,
  online,
  googlecb,
  signeout,
  verify,
  password,
  ressetpass,
} from "../../controllers/sessions.controller.js";
import validator from "../../middleware/joi.mid.js";
import usersSchema from "../../schemas/users.schema.js";

class SessionsRouter extends CustomRouter {
  init() {
    this.read("/", async (req, res, next) => {
      try {
      } catch (error) {
        return next(error);
      }
    });

    this.create(
      "/register",
      ["PUBLIC"],
      //passport.authenticate("register", { session: false }),
      validator(usersSchema),
      passportCb("register"),
      register
    );
    this.create("/verify", ["PUBLIC"], verify);
    this.create(
      "/login",
      ["PUBLIC"],
      passportCb("login"),
      //passport.authenticate("login", { session: false }),
      login
    );

    this.read(
      "/online",
      ["USER", "ADMIN"],
      //passportCb("jwt"),
      //passport.authenticate("jwt", { session: false }),
      online
    );

    this.create(
      "/signout",
      ["USER", "ADMIN"],
      //passportCb("jwt"),
      signeout
    );

    this.read(
      "/google",
      passport.authenticate("google", { scope: ["email", "profile"] })
    );
    this.read(
      "/google/callback",
      passport.authenticate("google", { session: false }),
      googlecb
    );
    this.create("/forgot", ["PUBLIC"], password);
    this.update("/ressetpass", ["PUBLIC"], ressetpass);
  }
}

const sessionsRouter = new SessionsRouter();
export default sessionsRouter.getRouter();
