// src/controllers/caja.controller.js
import cajaService from "../services/caja.service.js";
import cierreRepository from "../repositories/cierre.rep.js";
import ventasService from "../services/ventas.service.js";

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

  resumenDelDia = async (req, res, next) => {
    try {
      const { fecha } = req.query; // YYYY-MM-DD
      if (!fecha) return res.error400("Fecha requerida");
      const resumen = await cajaService.resumenDelDiaService(fecha);
      return res.exito200(resumen);
    } catch (error) {
      return next(error);
    }
  };
  // src/controllers/caja.controller.js
  aperturaCaja = async (req, res) => {
    try {
      const { efectivo = 0, mp = 0, transferencia = 0 } = req.body;

      const hoyAR = new Date(
        new Date().toLocaleString("en-US", {
          timeZone: "America/Argentina/Buenos_Aires",
        })
      );

      const fechaISO = hoyAR.toISOString().slice(0, 10);

      const resumen = await cajaService.resumenDelDiaService(fechaISO);
      const yaAbrio = resumen.movimientos.some(
        (m) => m.operacion === "apertura"
      );

      if (yaAbrio)
        return res
          .status(400)
          .json({ statusCode: 400, message: "La caja ya fue abierta hoy." });

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
      // Hora local Argentina
      const ahoraAR = new Date(
        new Date().toLocaleString("en-US", {
          timeZone: "America/Argentina/Buenos_Aires",
        })
      );

      const fechaISO = `${ahoraAR.getFullYear()}-${String(
        ahoraAR.getMonth() + 1
      ).padStart(2, "0")}-${String(ahoraAR.getDate()).padStart(2, "0")}`;
      const fechaLocal = new Date(`${fechaISO}T00:00:00.000-03:00`);

      // Verificar si ya hay un cierre hoy
      const yaCerro = await cierreRepository.existeCierreHoy(fechaISO);
      if (yaCerro) {
        return res
          .status(400)
          .json({ statusCode: 400, message: "La caja ya fue cerrada hoy." });
      }

      // Traer resumen del día
      const resumen = await cajaService.resumenDelDiaService(fechaISO);

      // dentro de cierreCaja, después de obtener `resumen`:
      const ventasReport = await ventasService.ventasDiariasService(fechaISO);
      // ventasReport = { fecha, ventas, totalVendido, gananciaTotal, cantidadVentas }

      const ventasRaw = Array.isArray(ventasReport.ventas)
        ? ventasReport.ventas
        : [];
      console.log("VENTAS RAW:", ventasReport.ventas);

      // Mapear ventas al formato que querés guardar en el cierre
      const ventasDetalladas = ventasRaw.map((v) => ({
        idVenta: String(v._id ?? v.id ?? ""),
        // usá la fecha de la venta (v.fecha) si la guardás, si no createdAt
        hora: v.fecha
          ? new Date(v.fecha)
          : v.createdAt
          ? new Date(v.createdAt)
          : null,
        total: Number(v.totalVenta ?? v.total ?? 0),
        metodo: v.metodoPago ?? v.metodo ?? "efectivo",
        productos: Array.isArray(v.items)
          ? v.items.map((it) => {
              // productoId puede venir como object con campos poblados o sólo id
              const prod = it.productoId ?? it.producto ?? {};
              return {
                id: String(prod._id ?? prod.id ?? it.productoId ?? ""),
                nombre: prod.nombre ?? prod.nombreProducto ?? "(sin nombre)",
                cantidad: Number(it.cantidad ?? it.cant ?? 0),
                precio: Number(
                  it.precioVenta ?? it.precio ?? prod.precioVenta ?? 0
                ),
              };
            })
          : [],
      }));

      // ahora armo cierreData usando resumen + ventasDetalladas
      const cierreData = {
        operacion: "cierre",
        fecha: fechaLocal,
        efectivo: resumen.efectivo,
        mp: resumen.mp,
        transferencia: resumen.transferencia,
        total: resumen.total,
        apertura:
          resumen.movimientos.find((m) => m.operacion === "apertura")?.monto ??
          0,
        ingresos: resumen.ingresos,
        egresos: resumen.egresos,
        cantidadVentas: ventasDetalladas.length,
        ventas: ventasDetalladas, // <-- nuevo campo
        usuario: req.user?.email ?? "desconocido",
        cierreHora: ahoraAR,
      };

      // Guardar cierre
      const cierre = await cierreRepository.crearCierre(cierreData);

      return res.json({ statusCode: 200, response: cierre });
    } catch (err) {
      if (err.code === 11000) {
        return res
          .status(400)
          .json({ statusCode: 400, message: "Ya existe un cierre para hoy." });
      }
      return res.status(500).json({ error: err.message });
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
} = cajaController;
export {
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
};
