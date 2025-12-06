//ENRUTADOR PRINCIPAL DEL RECURSO PRODUCTS

//import productsManager from "../../data/fs/ProductsManager.fs.js"; //cambiamos al de mongo
import CustomRouter from "../CustomRouter.js";

//import productsManager from "../../data/fs/ProductsManager.fs.js"; //cambiamos al de mongo
import {
  create,
  destroy,
  paginate,
  read,
  readOne,
  update,
} from "../../controllers/products.controller.js";

import validator from "../../middleware/joi.mid.js";
import productsSchema from "../../schemas/products.schema.js";
class ComprasRouter extends CustomRouter {
  init() {
    this.read("/paginate", ["PUBLIC"], paginate);
    this.create("/", ["PUBLIC"], validator(productsSchema), create); // cambiar validador
    this.update("/:_id", ["PUBLIC"], update);
    this.read("/:_id", ["PUBLIC"], readOne);
    this.read("/", ["PUBLIC"], read);
    this.destroy("/:pid", ["PUBLIC"], destroy);
  }
}

const comprasRouter = new ComprasRouter();
export default comprasRouter.getRouter();
