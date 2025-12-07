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
  // src/repositories/caja.rep.js
  async editarMovimiento(id, data) {
    return await this.model.Model.findByIdAndUpdate(id, data, { new: true });
  }
  async eliminarMovimiento(id) {
    return await this.model.Model.findByIdAndDelete(id);
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

  async obtenerBalance() {
    // 🔹 Obtener todos los movimientos (limit alto para seguridad)
    const movs = await this.obtenerMovimientos({ limit: 10000 });

    // 🔹 Fecha de hoy según hora Argentina
    const hoyAR = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "America/Argentina/Buenos_Aires",
      })
    );
    const hoyISO = hoyAR.toISOString().slice(0, 10); // YYYY-MM-DD

    // 🔹 Determinar si hubo apertura hoy
    const aperturaHoy = movs.some(
      (m) =>
        m.operacion === "apertura" &&
        m.fecha.toISOString().slice(0, 10) === hoyISO
    );

    // 🔹 Determinar si hubo cierre hoy
    const cierreHoy = await cierreRepository.existeCierreHoy(hoyISO);

    // 🔹 Calcular montos por método
    const efectivo = movs
      .filter((m) => m.metodo === "efectivo")
      .reduce((acc, m) => acc + (m.tipo === "ingreso" ? m.monto : -m.monto), 0);

    const mp = movs
      .filter((m) => m.metodo === "mp")
      .reduce((acc, m) => acc + (m.tipo === "ingreso" ? m.monto : -m.monto), 0);

    const transferencia = movs
      .filter((m) => m.metodo === "transferencia")
      .reduce((acc, m) => acc + (m.tipo === "ingreso" ? m.monto : -m.monto), 0);

    // 🔹 Resumen final
    return {
      efectivo,
      mp,
      transferencia,
      total: efectivo + mp + transferencia,
      aperturaHoy,
      cierreHoy,
      abierta: aperturaHoy && !cierreHoy, // 👈 clave para botón abrir/cerrar
    };
  }

  async obtenerResumenDelDia(fechaISO) {
    // fechaISO: "YYYY-MM-DD"
    // 🔹 Filtramos usando hora local Argentina
    const inicio = new Date(`${fechaISO}T00:00:00.000-03:00`);
    const fin = new Date(`${fechaISO}T23:59:59.999-03:00`);

    // Movimientos del día
    const movs = await this.model.Model.find({
      fecha: { $gte: inicio, $lte: fin },
    }).lean();

    // Apertura y cierre
    const aperturaHoy = movs.some((m) => m.operacion === "apertura");
    const cierreHoy = await cierreRepository.existeCierreHoy(fechaISO);

    // Totales por método
    const efectivo = movs
      .filter((m) => m.metodo === "efectivo")
      .reduce((acc, m) => acc + (m.tipo === "ingreso" ? m.monto : -m.monto), 0);

    const mp = movs
      .filter((m) => m.metodo === "mp")
      .reduce((acc, m) => acc + (m.tipo === "ingreso" ? m.monto : -m.monto), 0);

    const transferencia = movs
      .filter((m) => m.metodo === "transferencia")
      .reduce((acc, m) => acc + (m.tipo === "ingreso" ? m.monto : -m.monto), 0);

    // Totales generales
    const ingresos = movs
      .filter((m) => m.tipo === "ingreso")
      .reduce((acc, m) => acc + m.monto, 0);

    const egresos = movs
      .filter((m) => m.tipo === "egreso")
      .reduce((acc, m) => acc + m.monto, 0);

    const total = efectivo + mp + transferencia;

    return {
      fecha: fechaISO,
      efectivo,
      mp,
      transferencia,
      total,
      ingresos,
      egresos,
      movimientos: movs,
      aperturaHoy,
      cierreHoy,
      abierta: aperturaHoy && !cierreHoy,
    };
  }
}

const cajaRepository = new CajaRepository(caja);
export default cajaRepository;
