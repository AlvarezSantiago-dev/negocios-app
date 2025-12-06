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
  getGanancias,
  getVentasDiarias,
  getVentasMensuales,
  getUltimos7Dias,
} from "../../controllers/ventas.controller.js";

import validator from "../../middleware/joi.mid.js";
import ventasSchema from "../../schemas/ventas.schema.js";
class VentasRouter extends CustomRouter {
  init() {
    this.create("/", ["PUBLIC"], validator(ventasSchema), create);
    this.read("/", ["PUBLIC"], read);
    this.read("/paginate", ["PUBLIC"], paginate);
    this.read("/:_id", ["PUBLIC"], readOne);
    this.update("/:_id", ["PUBLIC"], update);
    this.destroy("/:_id", ["PUBLIC"], destroy);
    //ventas visualizacion /informes.
    this.read("/informes/ultimos-7-dias", ["PUBLIC"], getUltimos7Dias);

    this.read("/informes/diarias", ["PUBLIC"], getVentasDiarias);
    this.read("/informes/mensuales", ["PUBLIC"], getVentasMensuales);
    this.read("/informes/ganancias", ["PUBLIC"], getGanancias);
  }
}

const ventasRouter = new VentasRouter();
export default ventasRouter.getRouter();
