import { Schema, model } from "mongoose";

const collection = "cierres";

// --- Subdocumentos ---
const ProductoSchema = new Schema(
  {
    id: { type: String, required: true },
    nombre: { type: String, required: true },
    cantidad: { type: Number, required: true },
    precio: { type: Number, required: true },
  },
  { _id: false }
);

const VentaDetalleSchema = new Schema(
  {
    idVenta: { type: String, required: true },
    hora: { type: Date, required: true },
    total: { type: Number, required: true },
    metodo: { type: String, required: true },
    productos: { type: [ProductoSchema], default: [] },
  },
  { _id: false }
);

// --- Cierre principal ---
const cierreSchema = new Schema(
  {
    fecha: { type: Date, required: true },
    efectivo: { type: Number, default: 0 },
    mp: { type: Number, default: 0 },
    transferencia: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    apertura: { type: Number, default: 0 },
    ingresos: { type: Number, default: 0 },
    egresos: { type: Number, default: 0 },
    cantidadVentas: { type: Number, default: 0 },

    // ⭐ NUEVO
    ventas: { type: [VentaDetalleSchema], default: [] },
    totalVendido: { type: Number, default: 0 },
    gananciaTotal: { type: Number, default: 0 },

    usuario: { type: String, default: "" },
    cierreHora: { type: Date, default: null },
  },
  { timestamps: true }
);

// 🔹 ÍNDICE: evita dos cierres para la misma fecha
cierreSchema.index({ fecha: 1 }, { unique: true });

const Cierre = model(collection, cierreSchema);
export default Cierre;
