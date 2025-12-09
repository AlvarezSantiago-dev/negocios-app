import { model, Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const collection = "ventas";
/*
if (models[collection]) {
  export default models[collection];
}
  */

const itemSchema = new Schema({
  productoId: { type: Types.ObjectId, ref: "productos", required: true },
  cantidad: { type: Number, required: true },
  precioVenta: { type: Number, required: true },
  precioCompra: { type: Number, required: true },
  subtotal: { type: Number, required: true },
});

const schema = new Schema(
  {
    items: { type: [itemSchema], required: true },
    metodoPago: { type: String, default: "efectivo" },
    totalVenta: { type: Number, required: true },
    gananciaTotal: { type: Number, required: true },
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

schema.plugin(mongoosePaginate);

schema.pre("find", function () {
  this.populate(
    "items.productoId",
    "nombre tipo precioVenta precioCompra stock _id"
  );
});
schema.pre("find", function () {
  this.populate(
    "items.productoId",
    "nombre tipo precioVenta precioCompra stock"
  );
});

schema.pre("findOne", function () {
  this.populate(
    "items.productoId",
    "nombre tipo precioVenta precioCompra stock"
  );
});

const Venta = model(collection, schema);
export default Venta;
