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
} from "../../controllers/users.controller.js";

import validator from "../../middleware/joi.mid.js";
import usersSchema from "../../schemas/users.schema.js";
class UsersRouter extends CustomRouter {
  init() {
    this.read("/paginate", ["PUBLIC"], paginate);
    this.create("/", ["PUBLIC"], validator(usersSchema), create); // cambiar validador
    this.update("/:_id", ["PUBLIC"], update);
    this.read("/:_id", ["PUBLIC"], readOne);
    this.read("/", ["PUBLIC"], read);
    this.destroy("/:pid", ["PUBLIC"], destroy);
  }
}

const usersRouter = new UsersRouter();
export default usersRouter.getRouter();
