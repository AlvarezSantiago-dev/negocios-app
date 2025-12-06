// routers/products.router.js (reemplaza/actualiza tu ProductsRouter)
import CustomRouter from "../CustomRouter.js";
import {
  create,
  destroy,
  paginate,
  read,
  readOne,
  update,
  adjustStock,
  purchase,
  sell,
} from "../../controllers/products.controller.js";
import validator from "../../middleware/joi.mid.js";
import productsSchema from "../../schemas/products.schema.js";
class ProductsRouter extends CustomRouter {
  init() {
    this.read("/paginate", ["PUBLIC"], paginate);
    this.create("/", ["PUBLIC"], validator(productsSchema), create);
    this.update("/:_id", ["PUBLIC"], update);
    this.read("/:_id", ["PUBLIC"], readOne);
    this.read("/", ["PUBLIC"], read);
    this.destroy("/:_id", ["PUBLIC"], destroy);
    // Stock endpoints
    this.create("/:_id/stock", ["PUBLIC"], adjustStock); // body: { delta }
    11;
    this.create("/:_id/purchase", ["PUBLIC"], purchase); // body: { cantidad, unidad }
    this.create("/:_id/sell", ["PUBLIC"], sell); // body: { cantidad,
  }
}

const productsRouter = new ProductsRouter();
export default productsRouter.getRouter();
