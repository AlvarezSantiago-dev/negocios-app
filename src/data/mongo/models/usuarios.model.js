import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const collection = "usuarios";

const schema = new Schema(
  {
    nombre: { type: String },
    email: { type: String, required: true, unique: true },
    rol: { type: Number, enum: [0, 1], default: 0 },
    contraseña: { type: String, required: true },
  },
  { timestamps: true }
);

schema.plugin(mongoosePaginate);

const Usuario = model(collection, schema);

export default Usuario;
