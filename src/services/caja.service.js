// src/services/caja.service.js
import cajaRepository from "../repositories/caja.rep.js";
import productsRepository from "../repositories/products.rep.js";
import { fechaCompletaArg } from "../utils/fecha.js";
import Service from "./service.js";
import ventasService from "./ventas.service.js";
import ventasRepository from "../repositories/ventas.rep.js";
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
      fecha: data.fecha ?? fechaCompletaArg(),
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
  async editarMovimientoService(idMovimiento, data) {
    // 1) Obtener movimiento
    const mov = await cajaRepository.obtenerMovimientoPorId(idMovimiento);
    if (!mov) throw new Error("Movimiento no encontrado");

    // Si NO es venta → edición simple
    if (mov.operacion !== "venta") {
      const actualizado = await cajaRepository.editarMovimientoPorId(
        idMovimiento,
        data
      );
      return {
        message: "Movimiento actualizado correctamente",
        movimiento: actualizado,
      };
    }

    // ----------- SI ES UNA VENTA -------------------
    const idVenta = mov.ref;
    const venta = await ventasRepository.readOneRepository(idVenta);
    if (!venta) throw new Error("Venta vinculada no encontrada");

    // 2) Si mando items → recalcular stock y totales
    let nuevosItems = data.items || null;

    if (nuevosItems) {
      // A) devolver stock de la venta anterior
      for (const item of venta.items) {
        await productsRepository.modificarStock(item.productoId, item.cantidad);
      }

      // B) validar y descontar stock nuevo
      for (const item of nuevosItems) {
        const prod = await productsRepository.readOneRepository(
          item.productoId
        );
        if (!prod) {
          throw new Error("Producto no encontrado: " + item.productoId);
        }

        if (prod.stock < item.cantidad) {
          throw new Error(
            `Stock insuficiente para producto ${prod.nombre}. Disponible: ${prod.stock}, solicitado: ${item.cantidad}`
          );
        }

        // descontar stock
        await productsRepository.modificarStock(
          item.productoId,
          -item.cantidad
        );
      }

      // C) recalcular totales
      let total = 0;
      let ganancia = 0;

      for (const item of nuevosItems) {
        total += item.precioVenta * item.cantidad;
        // precio compra lo saco del repositorio directamente
        const prod = await productsRepository.readOneRepository(
          item.productoId
        );
        const precioCompra = prod.precioCompra;

        ganancia += (item.precioVenta - precioCompra) * item.cantidad;
      }

      venta.items = nuevosItems;
      venta.totalVenta = total;
      venta.gananciaTotal = ganancia;
    }

    // 3) Método de pago o fecha (si vienen en el body)
    if (data.metodo) venta.metodoPago = data.metodo;
    if (data.fecha) venta.fecha = data.fecha;

    // 4) Guardar venta
    const ventaActualizada = await ventasRepository.updateRepository(
      idVenta,
      venta
    );

    // 5) Actualizar movimiento con los datos finales
    const movActualizado = await cajaRepository.editarMovimientoPorId(
      idMovimiento,
      {
        monto: venta.totalVenta, // SIEMPRE igual al totalVenta
        metodo: venta.metodoPago,
        fecha: venta.fecha,
      }
    );

    return {
      message: "Movimiento y venta actualizados correctamente",
      movimiento: movActualizado,
      venta: ventaActualizada,
    };
  }

  async eliminarMovimientoService(id) {
    // 1) Traer movimiento REAL por ID
    const mov = await cajaRepository.obtenerMovimientoPorId(id);
    if (!mov) throw new Error("Movimiento no encontrado");

    // 2) Si NO es venta → borrado normal
    if (mov.operacion !== "venta") {
      return await cajaRepository.eliminarMovimientoPorId(id);
    }

    // 3) Si ES una venta → eliminar venta + devolver stock
    const idVenta = mov.ref;

    const venta = await ventasRepository.readOneRepository(idVenta);

    if (!venta) {
      // venta ya eliminada: borro movimiento igual
      return await cajaRepository.eliminarMovimientoPorId(id);
    }

    // 4) Devolver stock de la venta
    for (const item of venta.items) {
      await productsRepository.modificarStock(item.productoId, item.cantidad);
    }

    // 5) Borrar venta
    await ventasRepository.destroyRepository(idVenta);

    // 6) Borrar movimiento
    return await cajaRepository.eliminarMovimientoPorId(id);
  }
}

const cajaService = new CajaService();
export default cajaService;
