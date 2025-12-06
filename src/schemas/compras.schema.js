import joi from "joi-oid";

const compraSchema = joi.object({
  productoId: joi.objectId().required().messages({
    "any.required": "El productoId es obligatorio",
    "string.pattern.name": "Debe ser un ObjectId válido",
  }),

  cantidad: joi.number().integer().min(1).required().messages({
    "any.required": "La cantidad es obligatoria",
    "number.base": "La cantidad debe ser numérica",
    "number.integer": "La cantidad debe ser un número entero",
    "number.min": "La cantidad mínima es 1",
  }),

  precioCompra: joi.number().min(0).required().messages({
    "any.required": "El precio de compra es obligatorio",
    "number.base": "Debe ser numérico",
    "number.min": "No puede ser negativo",
  }),

  proveedor: joi.string().allow("").messages({
    "string.base": "El proveedor debe ser un texto",
  }),
});

export default compraSchema;
