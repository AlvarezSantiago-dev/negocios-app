import { fechaCompletaArg } from "../../utils/fecha.js";
import Manager from "./Manager.mongo.js";
import Product from "./models/products.model.js";

class ProductsManager extends Manager {
  constructor() {
    super(Product);
  }

  async registrarCompra(idProducto, { cantidad, precioCompra }) {
    const producto = await Product.findById(idProducto);
    if (!producto) throw new Error("Producto no encontrado");

    producto.stock += cantidad;
    producto.precioCompra = precioCompra;

    if (!producto.historialPrecios) producto.historialPrecios = [];

    producto.historialPrecios.push({
      precioCompra,
      fecha: new Date(),
    });

    await producto.save();
    return producto;
  }
}

const productsManager = new ProductsManager();
export default productsManager;
