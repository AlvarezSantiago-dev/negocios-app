import { Router } from "express";
import productsViewRouter from "./products.router.views.js";
const indexViewRouter = Router();

indexViewRouter.use("/products", productsViewRouter);

indexViewRouter.get("/", async (req, res, next) => {
  try {
    return res.render("index", { title: "Home" }); //mismo nombre que /src/layouts(archivo nombre)
  } catch (error) {
    next(error);
  }
});
indexViewRouter.get("/login", async (req, res, next) => {
  try {
    return res.render("login");
  } catch (error) {
    next(error);
  }
});
indexViewRouter.get("/register", async (req, res, next) => {
  try {
    return res.render("register");
  } catch (error) {
    next(error);
  }
});
export default indexViewRouter;
