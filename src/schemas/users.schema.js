import joi from "joi-oid";

const usuarioSchema = joi.object({
  nombre: joi.string().min(3).max(30).required().messages({
    "any.required": "El nombre es requerido",
    "string.base": "El nombre debe ser un texto",
    "string.empty": "El nombre no puede estar vacío",
    "string.min": "El nombre debe tener mínimo 3 caracteres",
    "string.max": "El nombre debe tener máximo 30 caracteres",
  }),

  email: joi.string().email().required().messages({
    "any.required": "El email es requerido",
    "string.email": "Debe proporcionar un email válido",
    "string.empty": "El email no puede estar vacío",
  }),

  rol: joi.number().optional().messages({
    "any.only": "El rol debe ser 0 o 1",
    "string.base": "El rol debe ser un numero",
  }),

  password: joi.string().min(6).required().messages({
    "any.required": "La password es requerida",
    "string.base": "La password debe ser un texto",
    "string.empty": "La password no puede estar vacía",
    "string.min": "La password debe tener mínimo 6 caracteres",
  }),
});

export default usuarioSchema;
