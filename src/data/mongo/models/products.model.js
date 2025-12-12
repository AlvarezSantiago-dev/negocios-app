import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const collection = "productos";
/*
if (models[collection]) {
  export default models[collection];
}
*/
const schema = new Schema(
  {
    nombre: { type: String, required: true, index: true },
    categoria: { type: String, default: "general", index: true },
    codigoBarras: { type: String, unique: true, sparse: true },

    tipo: {
      type: String,
      enum: ["unitario", "peso", "pack"],
      default: "unitario",
    },
    // para tipo pack
    unidadPorPack: { type: Number, default: 1 },
    precioCompraPack: { type: Number, default: 0 }, // costo por pack (si aplica)
    // precios / stock normalizados (precio por unidad o por kilo)
    precioCompra: { type: Number, required: true, default: 0 }, // precio unitario o por kilo
    precioVenta: { type: Number, required: true, default: 0 }, // precio unitario o por kilo
    stock: { type: Number, default: 0 }, // en unidades o en kilos según tipo
    foto: { type: String, default: "" },
    descripcion: { type: String, default: "" },
    historialCompras: [
      {
        cantidad: Number,
        tipo: String, // "pack"|"unidad"|"peso"
        precioCompraUnitario: Number,
        fecha: { type: Date, default: Date.now },
      },
    ],
    stockMinimo: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.plugin(mongoosePaginate);

const Producto = model(collection, schema);
export default Producto;
