import argsUtil from "../utils/args.util.js";
import crypto from "crypto";
import { fechaCompletaArg } from "../utils/fecha.js";

const persistence = argsUtil.persistence;

class CompraDTO {
  constructor(data) {
    if (persistence !== "mongo") {
      this._id = crypto.randomBytes(12).toString("hex");
    }

    this.productoId = data.productoId;
    this.cantidad = data.cantidad || 1;
    this.precioCompra = data.precioCompra || 0;
    this.proveedor = data.proveedor || "desconocido";
    this.fecha = data.fecha || fechaCompletaArg();

    if (persistence !== "mongo") {
      this.createdAt = fechaCompletaArg();
      this.updatedAt = fechaCompletaArg();
    }
  }
}

export default CompraDTO;
