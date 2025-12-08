import argsUtil from "../utils/args.util.js";
import crypto from "crypto";
import { fechaCompletaArg } from "../utils/fecha.js";
const persistence = argsUtil.persistence;

class CierreDTO {
  constructor(data = {}) {
    if (persistence !== "mongo") {
      this._id = crypto.randomBytes(12).toString("hex");
    }

    this.operacion = "cierre";

    this.fecha = data.fecha ?? fechaCompletaArg();

    this.efectivo = Number(data.efectivo ?? 0);
    this.mp = Number(data.mp ?? 0);
    this.transferencia = Number(data.transferencia ?? 0);

    this.total = Number(data.total ?? 0);

    this.apertura = Number(data.apertura ?? 0);
    this.ingresos = Number(data.ingresos ?? 0);
    this.egresos = Number(data.egresos ?? 0);

    this.cantidadVentas = Number(data.cantidadVentas ?? 0);
    this.usuario = data.usuario ?? null;
    this.gananciaTotal = Number(data.gananciaTotal ?? 0);
    this.gananciaNeta = Number(data.gananciaNeta ?? 0);
    this.totalVendido = Number(data.totalVendido ?? 0);

    this.cierreHora = data.cierreHora ?? fechaCompletaArg();

    // ⭐⭐ AGREGAR ESTO ⭐⭐
    this.ventas = Array.isArray(data.ventas) ? data.ventas : [];

    if (persistence !== "mongo") {
      this.createdAt = data.createdAt ?? fechaCompletaArg();
      this.updatedAt = data.updatedAt ?? fechaCompletaArg();
    }
  }
}

export default CierreDTO;
