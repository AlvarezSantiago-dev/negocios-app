import { Router } from "express";
import productsManager from "../../data/mongo/ProductsManager.mongo.js";

const productsViewRouter = Router();
productsViewRouter.get("/", async (req, res, next) => {
  try {
    const products = await productsManager.read();

    return res.render("products", { products });
  } catch (error) {
    next(error);
  }
});
export default productsViewRouter;
