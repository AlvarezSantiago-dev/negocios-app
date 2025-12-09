// src/repositories/caja.rep.js
import dao from "../data/dao.factory.js";
import CajaDTO from "../dto/caja.dto.js";
import cierreRepository from "./cierre.rep.js";
const { caja } = dao; // debe venir del factory

class CajaRepository {
  constructor(manager) {
    this.model = manager;
  }

  async crearMovimiento(data) {
    const dto = new CajaDTO(data);
    return await this.model.create(dto);
  }
  async readOneMovimiento(refId) {
    return await this.model.Model.findOne({
      operacion: "venta",
      ref: String(refId),
    });
  }

  // src/repositories/caja.rep.js
  async editarMovimiento(id, data) {
    return await this.model.Model.findByIdAndUpdate(id, data, { new: true });
  }
  async eliminarMovimiento(_id) {
    return await this.model.Model.findByIdAndDelete(_id);
  }

  async obtenerMovimientos({ desde = null, hasta = null, limit = 100 } = {}) {
    // usa model.read con filtro si el Manager expone read(filter)
    const filter = {};
    if (desde || hasta) {
      filter.fecha = {};
      if (desde) filter.fecha.$gte = new Date(desde);
      if (hasta) filter.fecha.$lte = new Date(hasta);
    }

    const movs = await this.model.read(filter);
    // ordenar por fecha descendente
    movs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    return movs.slice(0, Number(limit || 100));
  }

  async obtenerBalance(opts = {}) {
    const { desde, hasta } = opts;

    // -------------------------------
    // 1) Fecha "desde" y "hasta" finales
    // -------------------------------
    let fechaDesde, fechaHasta;

    if (desde && hasta) {
      // ✔ rango manual YYYY-MM-DD
      fechaDesde = new Date(`${desde}T00:00:00.000-03:00`);
      fechaHasta = new Date(`${hasta}T23:59:59.999-03:00`);
    } else {
      // ✔ modo ORIGINAL (solo el día actual)
      const hoyAR = new Date(
        new Date().toLocaleString("en-US", {
          timeZone: "America/Argentina/Buenos_Aires",
        })
      );
      const hoyISO = hoyAR.toISOString().slice(0, 10);
      fechaDesde = new Date(`${hoyISO}T00:00:00.000-03:00`);
      fechaHasta = new Date(`${hoyISO}T23:59:59.999-03:00`);
    }

    // --------------------------------
    // 2) Obtener movimientos filtrados por fecha
    // --------------------------------
    const movs = await this.model.Model.find({
      fecha: { $gte: fechaDesde, $lte: fechaHasta },
    }).lean();

    // --------------------------------
    // 3) Detectar apertura/cierre manteniendo tu lógica original
    // --------------------------------
    const diaISO = fechaDesde.toISOString().slice(0, 10);

    const aperturaHoy = movs.some(
      (m) =>
        m.operacion === "apertura" &&
        m.fecha.toISOString().slice(0, 10) === diaISO
    );

    const cierreHoy = await cierreRepository.existeCierreHoy(diaISO);

    // --------------------------------
    // 4) Calcular montos por método
    // --------------------------------
    const calcMetodo = (metodo) =>
      movs
        .filter((m) => m.metodo === metodo)
        .reduce(
          (acc, m) => acc + (m.tipo === "ingreso" ? m.monto : -m.monto),
          0
        );

    const efectivo = calcMetodo("efectivo");
    const mp = calcMetodo("mp");
    const transferencia = calcMetodo("transferencia");

    // --------------------------------
    // 5) Respuesta final
    // --------------------------------
    return {
      efectivo,
      mp,
      transferencia,
      total: efectivo + mp + transferencia,
      aperturaHoy,
      cierreHoy,
      abierta: aperturaHoy && !cierreHoy,
      rango: {
        desde: fechaDesde,
        hasta: fechaHasta,
      },
    };
  }
}

const cajaRepository = new CajaRepository(caja);
export default cajaRepository;
