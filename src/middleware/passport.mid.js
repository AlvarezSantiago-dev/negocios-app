import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as LocalStrategy } from "passport-local";
import usersRepository from "../repositories/users.rep.js";
import environment from "../utils/env.util.js";
import { createHash, verifyHash } from "../utils/hash.util.js";
import { createToken } from "../utils/token.util.js";

import sendEmail from "../utils/mailing.util.js";
import registerEmailTemplate from "../utils/emails/register.email.js";
passport.use(
  "register",
  new LocalStrategy(
    {
      passReqToCallback: true,
      usernameField: "email",
      passwordField: "contraseña",
    },
    async (req, email, password, done) => {
      try {
        if (!email || !password) {
          const error = new Error("Please enter email and password!");
          error.statusCode = 401;
          return done(null, false, error);
        }

        const existing = await usersRepository.readByEmailRepository(email);
        if (existing) {
          const error = new Error("Bad auth from register!");
          error.statusCode = 401;
          return done(error);
        }
        const user = await usersRepository.createRepository(req.body);

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
//una vez q el usueario se creo..
// la estrategia debe enviar un correo electronico con un codigo aleatorio para la verificacion del usuario.
/*
        await sendEmail({
          to: user.email,
          subject: `Verificación de cuenta`,
          html: registerEmailTemplate({
            name: user.name,
            code: user.verifyCode,
          }),

        });
*/

passport.use(
  "login",
  new LocalStrategy(
    {
      passReqToCallback: true,
      usernameField: "email",
      passwordField: "contraseña",
    },
    async (req, email, contraseña, done) => {
      try {
        const user = await usersRepository.readByEmailRepository(email);
        if (!user) {
          const error = new Error("Bad auth from login");
          error.statusCode = 401;
          return done(error);
        }
        const verifyPass = verifyHash(contraseña, user.contraseña);
        //const verfifyAccount = user.verify;
        //Ahora no solo verifico la contrasena sino que ahora verifico
        //que el usuario tenga la prop verify en true.
        if (verifyPass) {
          const data = {
            email,
            role: Number(user.role) || 0,
            online: true,
            _id: user._id,
          };

          const token = createToken(data);
          user.token = token;

          return done(null, user);
          //agrega la propiedad al objeto de requerimientos
        } else {
          const error = new Error("Invalid credentials");
          error.statusCode = 401;
          return done(error);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: environment.GOOGLE_CLIENT_ID,
      clientSecret: environment.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/api/sessions/google/callback",
      passReqToCallback: true,
    },
    async (req, accesToken, refreshToken, profile, done) => {
      try {
        //busco por un id en un email.
        //se registra un id en lugar de un email porque funcionan diferente
        let { id, name, picture } = profile;

        let user = await usersRepository.readByEmailRepository(id);
        if (!user) {
          user = {
            email: id,
            name: name.giveName,
            photo: picture,
            password: createHash(id),
          };
          console.log("usuario creado" + user);
          user = await usersRepository.createRepository(user);
        }
        //
        const data = {
          email: id,
          online: true,
          role: user.role,
          user_id: user._id,
        };
        const token = createToken(data);
        user.token = token;
        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

/*passport.use(
  "jwt",
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies["token"],
      ]),
      secretOrKey: process.env.SECRET_JWT, // LA MISMA
    },
    (data, done) => {
      try {
        if (data) {
          return done(null, data);
        } else {
          const error = new Error("Forbidden from jwt!");
          error.statusCode = 403;
          return done(error);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);
*/
export default passport;
