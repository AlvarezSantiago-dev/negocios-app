import joi from "joi-oid";

const packSchema = joi.object({
  unidades: joi.number().integer().min(2).required(),
  precioVentaPack: joi.number().min(0).required(),
});

const productoSchema = joi.object({
  nombre: joi.string().trim().min(1).max(120).required(),

  categoria: joi.string().trim().max(50).default("general"),

  tipo: joi.string().valid("unitario", "peso").required(),

  precioCompra: joi.number().min(0).required(),
  precioVenta: joi.number().min(0).required(),

  packs: joi.array().items(packSchema).default([]),

  stock: joi.number().min(0).default(0),
  stockMinimo: joi.number().min(0).default(0),

  foto: joi.string().allow("").optional(),
  codigoBarras: joi.string().allow("").optional(),
  descripcion: joi.string().allow("").optional(),
});

export default productoSchema;
