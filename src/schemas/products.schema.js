import joi from "joi-oid";

const productoSchema = joi.object({
  nombre: joi.string().trim().min(1).max(120).required(),

  categoria: joi.string().trim().max(50).default("general"),

  tipo: joi.string().valid("unitario", "peso", "pack").required(),

  // Precio compra por unidad (solo unitario o peso)
  precioCompra: joi
    .number()
    .min(0)
    .when("tipo", {
      is: joi.valid("unitario", "peso"),
      then: joi.required(),
      otherwise: joi.forbidden(),
    }),

  // Precio venta SIEMPRE requerido
  precioVenta: joi.number().min(0).required(),

  // Campos SOLO para pack
  precioCompraPack: joi.number().min(0).when("tipo", {
    is: "pack",
    then: joi.required(),
    otherwise: joi.forbidden(),
  }),

  unidadPorPack: joi.number().integer().min(1).when("tipo", {
    is: "pack",
    then: joi.required(),
    otherwise: joi.forbidden(),
  }),

  // Stock siempre en UNIDADES (para peso se usa unidades = kg * 1000 si querés)
  stock: joi.number().min(0).default(0),

  // Stock mínimo para alertas
  stockMinimo: joi.number().min(0).default(0),

  // Foto opcional
  foto: joi.string().allow("").optional(),
  codigoBarras: joi.string().allow("").optional(),

  descripcion: joi.string().allow("").optional(),
});

export default productoSchema;
