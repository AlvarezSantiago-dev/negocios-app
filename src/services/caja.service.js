// src/services/caja.service.js
import Service from "./service.js";
import cajaRepository from "../repositories/caja.rep.js";
import cierreRepository from "../repositories/cierre.rep.js";

class CajaService extends Service {
  constructor() {
    super(cajaRepository);
  }

  async crearMovimientoService(data) {
    // validaciones mínimas: aceptamos monto = 0
    if (
      !data.tipo ||
      !data.motivo ||
      data.monto === undefined ||
      !data.metodo
    ) {
      throw new Error("Faltan campos para crear movimiento de caja");
    }

    // Normalizar campos mínimos que el DTO/Model esperan
    const payload = {
      tipo: data.tipo,
      motivo: data.motivo,
      monto: Number(data.monto ?? 0),
      metodo: data.metodo,
      ref: data.ref ?? null,
      operacion: data.operacion ?? "movimiento",
      fecha: data.fecha ?? new Date(),
      detalleCierre: data.detalleCierre ?? undefined,
    };

    return await cajaRepository.crearMovimiento(payload);
  }

  async obtenerMovimientosService(opts) {
    return await cajaRepository.obtenerMovimientos(opts);
  }

  async obtenerBalanceService(opts) {
    return await cajaRepository.obtenerBalance(opts);
  }

  async resumenDelDiaService(fechaISO) {
    return await cajaRepository.obtenerResumenDelDia(fechaISO);
  }

  // src/services/caja.service.js
  async editarMovimientoService(id, data) {
    return await cajaRepository.editarMovimiento(id, data);
  }
  async eliminarMovimientoService(id) {
    return await cajaRepository.eliminarMovimiento(id);
  }
}

const cajaService = new CajaService();
export default cajaService;
