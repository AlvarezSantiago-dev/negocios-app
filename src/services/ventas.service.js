import Service from "./service.js";
import ventasRepository from "../repositories/ventas.rep.js";
import sendEmail from "../utils/mailing.util.js";
import informeDiarioEmail from "../utils/emails/informeDiarioEmail.js";
import cajaRepository from "../repositories/caja.rep.js";
import cajaService from "./caja.service.js";
import { fechaCompletaArg } from "../utils/fecha.js";
import productsRepository from "../repositories/products.rep.js";
class VentasService extends Service {
  constructor() {
    super(ventasRepository);
  }

  // Método principal que usa el repository con la lógica
  crearVentaConLogica = async (data) => {
    // 1) Crear venta, procesar stock, márgenes y totales (repository hace la mayor parte)
    const venta = await this.repository.createRepository(data);

    // 2) Registrar movimiento de caja automáticamente (intentamos, pero no rompemos la venta si falla)
    try {
      await cajaService.crearMovimientoService({
        tipo: "ingreso",
        motivo: "Venta",
        monto: Number(venta.totalVenta ?? 0),
        metodo: venta.metodoPago || data.metodoPago || "efectivo",
        ref: venta._id,
        operacion: "venta",
        fecha: data.fecha ?? new Date(),
      });
    } catch (err) {
      // loguear y seguir: la venta ya fue registrada y el error de caja no debe eliminarla automáticamente.
      // Si querés revertir la venta en caso de fallo en caja, podemos implementar rollback (no lo hago por simplicidad).
      console.error(
        "No se pudo registrar movimiento en caja automáticamente:",
        err.message
      );
    }

    // 3) Devolver la venta creada
    return venta;
  };

  async ventasDiariasService(fecha) {
    const fechaLimpia =
      fecha instanceof Date
        ? fecha.toISOString().substring(0, 10)
        : String(fecha).substring(0, 10);

    // Trae ventas de ese día
    const ventas = await ventasRepository.ventasDiarias(fechaLimpia);

    // Totales
    const totalVendido = ventas.reduce(
      (acc, v) => acc + Number(v.totalVenta || 0),
      0
    );

    const gananciaTotal = ventas.reduce(
      (acc, v) => acc + Number(v.gananciaTotal || 0),
      0
    );

    return {
      fecha: fechaLimpia,
      ventas,
      totalVendido,
      gananciaTotal,
      cantidadVentas: ventas.length,
    };
  }

  ventasMensualesService = async (year, month) => {
    return await this.repository.ventasMensuales(year, month);
  };

  gananciasService = async (data) => {
    return await this.repository.ganancias(data);
  };
  // src/services/ventas.service.js

  destroyService = async (_id) => {
    const venta = await ventasRepository.readOneRepository(_id);
    if (!venta) return null;

    // 1) devolver stock
    for (const item of venta.items) {
      await productsRepository.modificarStock(item.productoId, item.cantidad);
    }

    // 2) borrar movimiento de caja asociado
    await cajaRepository.eliminarPorRefVenta(_id);

    // 3) borrar venta
    return await ventasRepository.destroyRepository(_id);
  };

  // src/services/ventas.service.js

  updateService = async (_id, data) => {
    const ventaAnterior = await ventasRepository.readOneRepository(_id);
    if (!ventaAnterior) throw new Error("Venta no encontrada");

    // 1) devolver stock anterior
    for (const item of ventaAnterior.items) {
      await productsRepository.modificarStock(item.productoId, item.cantidad);
    }

    // 2) actualizar venta
    const ventaActualizada = await ventasRepository.updateRepository(_id, data);

    // 3) descontar stock nuevo
    for (const item of ventaActualizada.items) {
      await productsRepository.modificarStock(item.productoId, -item.cantidad);
    }

    return ventaActualizada;
  };
}

const ventasService = new VentasService();
export default ventasService;

export const {
  createService,
  readService,
  readOneService,
  updateService,
  destroyService,
  paginateService,
  gananciasService,
  ventasDiariasService,
  ventasMensualesService,
  crearVentaConLogica,
} = ventasService;
