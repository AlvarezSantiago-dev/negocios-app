// src/controllers/caja.controller.js
import cierreRepository from "../repositories/cierre.rep.js";
import cajaService from "../services/caja.service.js";
import ventasService from "../services/ventas.service.js";
import { fechaCompletaArg, hoyArg } from "../utils/fecha.js";

class CajaController {
  crearMovimiento = async (req, res, next) => {
    try {
      const data = req.body;
      const mov = await cajaService.crearMovimientoService(data);
      return res.exito201(mov);
    } catch (error) {
      return next(error);
    }
  };

  obtenerMovimientos = async (req, res, next) => {
    try {
      const { desde, hasta, limit } = req.query;
      const movs = await cajaService.obtenerMovimientosService({
        desde,
        hasta,
        limit: limit ? Number(limit) : 100,
      });
      return res.exito200(movs);
    } catch (error) {
      return next(error);
    }
  };

  obtenerBalance = async (req, res, next) => {
    try {
      const { desde, hasta } = req.query;
      const resumen = await cajaService.obtenerBalanceService({ desde, hasta });
      return res.exito200(resumen);
    } catch (error) {
      return next(error);
    }
  };
  //update para fechas
  resumenDelDia = async (req, res, next) => {
    try {
      const { fecha } = req.query; // YYYY-MM-DD
      if (!fecha) return res.error400("Fecha requerida");

      const resumen = await cajaService.resumenDelDiaService(fecha);

      // 🔹 flag para frontend
      resumen.abierta = resumen.movimientos.some(
        (m) => m.operacion === "apertura"
      );

      return res.exito200(resumen);
    } catch (error) {
      return next(error);
    }
  };

  // src/controllers/caja.controller.js
  aperturaCaja = async (req, res) => {
    try {
      const { efectivo = 0, mp = 0, transferencia = 0 } = req.body;

      const hoyAR = fechaCompletaArg();
      const fechaISO = hoyAR.toISOString().slice(0, 10);
      const resumen = await cajaService.resumenDelDiaService(fechaISO);
      const yaAbrio = resumen.movimientos.some(
        (m) => m.operacion === "apertura"
      );

      if (yaAbrio)
        return res.status(400).json({
          statusCode: 400,
          message: "La caja ya fue abierta hoy.",
        });

      const movimientosApertura = [];

      if (efectivo > 0)
        movimientosApertura.push({
          tipo: "ingreso",
          motivo: "Apertura de Caja",
          monto: Number(efectivo),
          metodo: "efectivo",
          operacion: "apertura",
          fecha: hoyAR,
        });

      if (mp > 0)
        movimientosApertura.push({
          tipo: "ingreso",
          motivo: "Apertura de Caja",
          monto: Number(mp),
          metodo: "mp",
          operacion: "apertura",
          fecha: hoyAR,
        });

      if (transferencia > 0)
        movimientosApertura.push({
          tipo: "ingreso",
          motivo: "Apertura de Caja",
          monto: Number(transferencia),
          metodo: "transferencia",
          operacion: "apertura",
          fecha: hoyAR,
        });

      const resultados = [];
      for (const mov of movimientosApertura) {
        const creado = await cajaService.crearMovimientoService(mov);
        resultados.push(creado);
      }

      res.json({ statusCode: 200, response: resultados });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // src/controllers/caja.controller.js
  cierreCaja = async (req, res) => {
    try {
      // Hora REAL Argentina
      const ahoraAR = new Date(
        new Date().toLocaleString("en-US", {
          timeZone: "America/Argentina/Buenos_Aires",
        })
      );

      const fechaISO = ahoraAR.toISOString().slice(0, 10);
      const inicioAR = new Date(`${fechaISO}T00:00:00-03:00`);

      // Evita cierre duplicado
      // condicionar anterior if (await cierreRepository.existeCierreHoy(fechaISO)) {
      if (await cierreRepository.existeCierreActivoHoy(fechaISO)) {
        return res.status(400).json({
          statusCode: 400,
          message: "La caja ya fue cerrada hoy.",
        });
      }

      // Resumen movimientos
      const resumen = await cajaService.resumenDelDiaService(fechaISO);

      // Reporte ventas
      const ventasReport = await ventasService.ventasDiariasService(fechaISO);

      const ventasDetalladas = ventasReport.ventas.map((v) => ({
        idVenta: String(v._id),
        hora: fechaCompletaArg(),
        total: Number(v.totalVenta),
        ganancia: Number(v.gananciaTotal),
        metodo: v.metodoPago,
        productos: v.items.map((it) => ({
          id: String(it.productoId?._id),
          nombre: it.productoId?.nombre ?? "(sin nombre)",
          cantidad: it.cantidad,
          precio: it.precioVenta,
        })),
      }));

      // 👉 Suma correcta de TODAS las aperturas
      const aperturas = resumen.movimientos.filter(
        (m) => m.operacion === "apertura"
      );
      const aperturaTotal = aperturas.reduce((acc, mov) => acc + mov.monto, 0);

      // Total real del cierre
      const totalReal = resumen.ingresos - resumen.egresos;

      const cierreData = {
        operacion: "cierre",
        fecha: inicioAR,
        cierreHora: fechaCompletaArg(),
        efectivo: resumen.efectivo,
        mp: resumen.mp,
        transferencia: resumen.transferencia,
        totalVendido: ventasReport.totalVendido,
        gananciaTotal: ventasReport.gananciaTotal,
        gananciaNeta: ventasReport.gananciaTotal - resumen.egresos,
        total: totalReal,
        apertura: aperturaTotal, // <-- CORRECTO
        ingresos: resumen.ingresos,
        egresos: resumen.egresos,
        cantidadVentas: ventasDetalladas.length,
        ventas: ventasDetalladas,
        usuario: req.user?.email ?? "desconocido",
      };

      const cierre = await cierreRepository.crearCierre(cierreData);

      return res.json({ statusCode: 200, response: cierre });
    } catch (error) {
      console.error("ERROR cierreCaja:", error);
      return res.status(500).json({ error: error.message });
    }
  };
  anularCierreCaja = async (req, res) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      if (!motivo) {
        return res.status(400).json({
          statusCode: 400,
          message: "Debe indicar un motivo de anulación",
        });
      }

      const cierre = await cierreRepository.obtenerPorId(id);
      if (!cierre) {
        return res.status(404).json({ message: "Cierre no encontrado" });
      }

      if (cierre.estado === "anulado") {
        return res.status(400).json({ message: "El cierre ya está anulado" });
      }

      const cierreAnulado = await cierreRepository.anularCierre(id, {
        anuladoPor: req.user?.email ?? "desconocido",
        anuladoMotivo: motivo,
      });

      return res.json({ statusCode: 200, response: cierreAnulado });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  historialCierres = async (req, res, next) => {
    try {
      const cierres = await cierreRepository.obtenerCierres();
      return res.exito200(cierres);
    } catch (err) {
      return next(err);
    }
  };
  ultimos7Cierres = async (req, res, next) => {
    try {
      const data = await cierreRepository.obtenerUltimos7Dias();
      return res.exito200(data);
    } catch (error) {
      next(error);
    }
  };

  async getCajaActual(req, res) {
    try {
      const hoyISO = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const caja = await cajaRepository.obtenerCajaPorFecha(hoyISO);

      return res.json({
        statusCode: 200,
        response: caja ?? null,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  // MOVIMIENTOS DE UNA CAJA
  async getMovimientos(req, res) {
    try {
      const { idCaja } = req.params;
      const movimientos = await movimientoRepository.obtenerPorCaja(idCaja);

      return res.json({
        statusCode: 200,
        response: movimientos,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
  // src/controllers/caja.controller.js
  editarMovimiento = async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const mov = await cajaService.editarMovimientoService(id, data);
      res.json({ statusCode: 200, response: mov });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  eliminarMovimiento = async (req, res) => {
    try {
      const { id } = req.params;
      await cajaService.eliminarMovimientoService(id);
      res.json({ statusCode: 200, response: "Movimiento eliminado" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

const cajaController = new CajaController();
const {
  crearMovimiento,
  obtenerBalance,
  obtenerMovimientos,
  resumenDelDia,
  aperturaCaja,
  cierreCaja,
  historialCierres,
  editarMovimiento,
  eliminarMovimiento,
  ultimos7Cierres,
  anularCierreCaja,
} = cajaController;
export {
  aperturaCaja,
  cierreCaja,
  crearMovimiento,
  editarMovimiento,
  eliminarMovimiento,
  historialCierres,
  obtenerBalance,
  obtenerMovimientos,
  resumenDelDia,
  ultimos7Cierres,
  anularCierreCaja,
};
