import { Schema, model, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const collection = "compras";

const schema = new Schema(
  {
    producto_id: {
      type: Types.ObjectId,
      ref: "productos",
      required: true,
      index: true,
    },
    cantidad: { type: Number, required: true },
    precioCompraUnitario: { type: Number, required: true },
    costoTotal: { type: Number, required: true },
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

schema.plugin(mongoosePaginate);

// POPULATES
schema.pre("find", function () {
  this.populate("producto_id", "nombre categoria precioCompra precioVenta");
});
schema.pre("findOne", function () {
  this.populate("producto_id", "nombre categoria precioCompra precioVenta");
});

const Compra = model(collection, schema);

export default Compra;
