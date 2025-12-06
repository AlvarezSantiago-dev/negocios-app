// src/dto/ventas.dto.js
import argsUtil from "../utils/args.util.js";
import crypto from "crypto";

const persistence = argsUtil.persistence;

class VentaDTO {
  constructor(data) {
    if (persistence !== "mongo") {
      this._id = crypto.randomBytes(12).toString("hex");
    }

    // items ya vienen procesados por repository
    this.items = Array.isArray(data.items) ? data.items : [];
    this.metodoPago = data.metodoPago || "efectivo";
    this.totalVenta = Number(data.totalVenta ?? 0);
    this.gananciaTotal = Number(data.gananciaTotal ?? 0);

    // Aseguramos que la fecha sea un objeto Date
    this.fecha = data.fecha ? new Date(data.fecha) : new Date();

    if (persistence !== "mongo") {
      this.createdAt = data.createdAt ?? new Date();
      this.updatedAt = data.updatedAt ?? new Date();
    }
  }
}

export default VentaDTO;
