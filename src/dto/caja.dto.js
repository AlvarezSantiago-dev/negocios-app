// src/dto/caja.dto.js
import argsUtil from "../utils/args.util.js";
import crypto from "crypto";
import { fechaCompletaArg } from "../utils/fecha.js";

const persistence = argsUtil.persistence;

class CajaDTO {
  constructor(data = {}) {
    if (persistence !== "mongo") {
      this._id = crypto.randomBytes(12).toString("hex");
    }

    // tipo: ingreso | egreso
    this.tipo = data.tipo; // required
    this.motivo = data.motivo; // required
    this.monto = Number(data.monto ?? 0); // required
    // metodo: efectivo | mp | transferencia
    this.metodo = data.metodo;
    this.operacion = data.operacion ?? "movimiento";

    this.ref = data.ref ?? null; // referencia (venta id, compra id, etc)
    this.fecha = data.fecha ?? new Date();

    if (persistence !== "mongo") {
      this.createdAt = data.createdAt ?? new Date();
      this.updatedAt = data.updatedAt ?? new Date();
    }
  }
}

export default CajaDTO;
