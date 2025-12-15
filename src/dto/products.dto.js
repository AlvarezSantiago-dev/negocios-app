import argsUtil from "../utils/args.util.js";
import crypto from "crypto";

const persistence = argsUtil.persistence;

class ProductoDTO {
  constructor(data = {}) {
    if (persistence !== "mongo") {
      this._id = crypto.randomBytes(12).toString("hex");
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }

    this.codigoBarras = data.codigoBarras
      ? String(data.codigoBarras)
      : undefined;

    this.nombre = String(data.nombre).trim();
    this.categoria = data.categoria ?? "general";

    // 🔒 solo unitario o peso
    this.tipo = data.tipo ?? "unitario";

    this.precioCompra = Number(data.precioCompra ?? 0);
    this.precioVenta = Number(data.precioVenta ?? 0);

    // packs configurables
    this.packs = Array.isArray(data.packs)
      ? data.packs.map((p) => ({
          unidades: Number(p.unidades),
          precioVentaPack: Number(p.precioVentaPack),
        }))
      : [];

    this.stock = Number(data.stock ?? 0);
    this.stockMinimo = Number(data.stockMinimo ?? 0);

    this.foto = data.foto ?? "";
    this.descripcion = data.descripcion ?? "";

    if (persistence !== "mongo") {
      this.createdAt = data.createdAt ?? new Date();
      this.updatedAt = data.updatedAt ?? new Date();
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
