import joi from "joi-oid";

const ventaItemSchema = joi.object({
  productoId: joi.objectId().required(),
  cantidad: joi.number().positive().required(),
  precioVenta: joi.number().min(0).optional(),
});

const ventasSchema = joi.object({
  items: joi.array().items(ventaItemSchema).min(1).required(),
  metodoPago: joi
    .string()
    .valid("efectivo", "debito", "credito", "mp", "transferencia", "tarjeta")
    .default("efectivo"),
  fecha: joi.date().optional(),
});

export default ventasSchema;
