import argsUtil from "../utils/args.util.js";
import crypto from "crypto";
import { fechaCompletaArg } from "../utils/fecha.js";
const persistence = argsUtil.persistence;
class ProductoDTO {
  constructor(data = {}) {
    if (persistence !== "mongo") {
      this._id = crypto.randomBytes(12).toString("hex");
      this.createdAt = fechaCompletaArg();
      this.updatedAt = fechaCompletaArg();
    }
    this.nombre = String(data.nombre).trim();
    this.categoria = data.categoria ?? "general";
    this.tipo = data.tipo ?? "unitario"; // unitario | peso | pack
    if (this.tipo === "pack") {
      this.unidadPorPack = Number(data.unidadPorPack);
      this.precioCompraPack = Number(data.precioCompraPack);
      this.precioCompra =
        this.unidadPorPack > 0 ? this.precioCompraPack / this.unidadPorPack : 0;
      this.precioVenta = Number(data.precioVenta ?? 0);
    } else if (this.tipo === "peso") {
      this.precioCompra = Number(data.precioCompra ?? 0);
      this.precioVenta = Number(data.precioVenta ?? 0);
      this.unidadPorPack = undefined;
      this.precioCompraPack = undefined;
    } else {
      this.precioCompra = Number(data.precioCompra ?? 0);
      this.precioVenta = Number(data.precioVenta ?? 0);
      this.unidadPorPack = undefined;
      this.precioCompraPack = undefined;
    }
    // stock stored as UNITS
    this.stock = Number(data.stock ?? 0);
    this.foto = data.foto ?? "";
    this.descripcion = data.descripcion ?? "";
    this.stockMinimo = Number(data.stockMinimo ?? 0);
    this.historialCompras = Array.isArray(data.historialCompras)
      ? data.historialCompras
      : [];
    if (persistence !== "mongo") {
      this.createdAt = data.createdAt ?? fechaCompletaArg();
      this.updatedAt = data.updatedAt ?? fechaCompletaArg();
    }
  }
}
export default ProductoDTO;

/*
 title: { type: String, required: true, index: true },
    photo: { type: String },
    category: {
      type: String,
      default: "to do",
      enum: ["to do", "done"],
      index: true,
    }, //enum sirve para limitar las posibilidades
    price: { type: Number, required: true },
    stock: { type: Number },
    quantity: { type: Number, default: 1 },
  },
  { timestamps: true }
*/
