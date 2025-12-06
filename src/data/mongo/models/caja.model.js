// src/models/caja.model.js
import mongoose from "mongoose";
const collection = "caja";
const schema = new mongoose.Schema(
  {
    tipo: { type: String, enum: ["ingreso", "egreso"], required: true },
    motivo: { type: String, required: true },
    monto: { type: Number, required: true },
    metodo: {
      type: String,
      enum: ["efectivo", "mp", "transferencia"],
      required: true,
    },
    operacion: {
      type: String,
      enum: ["apertura", "cierre", "movimiento", "venta"],
      default: "movimiento",
    },

    ref: { type: String, default: null },
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Caja = mongoose.model(collection, schema);
export default Caja;
