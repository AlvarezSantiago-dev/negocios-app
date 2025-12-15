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
      enum: ["unitario", "peso"],
      default: "unitario",
    },

    // precios base
    precioCompra: { type: Number, required: true, default: 0 },
    precioVenta: { type: Number, required: true, default: 0 },

    // packs configurables
    packs: [
      {
        unidades: { type: Number, required: true },
        precioVentaPack: { type: Number, required: true },
      },
    ],

    stock: { type: Number, default: 0 },
    stockMinimo: { type: Number, default: 0 },

    foto: { type: String, default: "" },
    descripcion: { type: String, default: "" },
  },
  { timestamps: true }
);

schema.plugin(mongoosePaginate);

const Producto = model(collection, schema);
export default Producto;
