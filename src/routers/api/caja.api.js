// routers/products.router.js (reemplaza/actualiza tu ProductsRouter)

// src/routers/caja.router.js
import {
  aperturaCaja,
  cierreCaja,
  crearMovimiento,
  historialCierres,
  obtenerBalance,
  obtenerMovimientos,
  resumenDelDia,
  editarMovimiento,
  eliminarMovimiento,
  ultimos7Cierres,
} from "../../controllers/caja.controller.js";
import cierreRepository from "../../repositories/cierre.rep.js";
import CustomRouter from "../CustomRouter.js";
class CajaRouter extends CustomRouter {
  init() {
    this.create("/movimiento", ["PUBLIC"], crearMovimiento);
    this.read("/movimientos", ["PUBLIC"], obtenerMovimientos);
    this.read("/resumen", ["PUBLIC"], obtenerBalance); // /resumen?desde=&hasta=
    this.read("/dia", ["PUBLIC"], resumenDelDia); // /dia?fecha=YYYY-MM-DD
    this.create("/apertura", ["PUBLIC"], aperturaCaja);
    this.create("/cierre", ["PUBLIC"], cierreCaja);
    this.read("/cierres", ["PUBLIC"], historialCierres);
    // src/routers/caja.router.js
    this.update("/movimiento/:id", ["PUBLIC"], editarMovimiento);
    this.destroy("/movimiento/:id", ["PUBLIC"], eliminarMovimiento);
    this.read("/cierres/ultimos7", ["PUBLIC"], ultimos7Cierres);
  }
}

const cajaRouter = new CajaRouter();
export default cajaRouter.getRouter();
