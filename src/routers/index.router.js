/* FORMA VIEJA
import { Router } from "express";



const indexRouter = Router();
indexRouter.use("/api", apiRouter);
indexRouter.use("/", indexViewRouter);
export default indexRouter;
*/
import indexViewRouter from "./views/index.router.views.js";
import apiRouter from "./api/index.api.js";
import CustomRouter from "./CustomRouter.js";
import sendEmail from "../utils/mailing.util.js";

class IndexRouter extends CustomRouter {
  init() {
    this.use("/api", apiRouter);
    this.create("/nodemailer", ["PUBLIC"], async (req, res, next) => {
      try {
        const { email, name } = req.body;
        await sendEmail({ to: email, name });
        return res.exitoMensaje("Email enviado");
      } catch (error) {
        return next(error);
      }
    });
    this.use("/", indexViewRouter);
    this.read("/simplex", ["PUBLIC"], (req, res, next) => {
      try {
        let total = 1;
        for (let i = 1; i < 100; i++) {
          total = i * i;
        }
        return res.send({ total });
      } catch (error) {
        next(error);
      }
    });
    //complex
    this.read("/complex", ["PUBLIC"], (req, res, next) => {
      try {
        let total = 1;
        for (let i = 1; i < 5000000000; i++) {
          total = i * i;
        }
        return res.send({ total });
      } catch (error) {
        next(error);
      }
    });
  }
}
const indexRouter = new IndexRouter();
export default indexRouter.getRouter();
