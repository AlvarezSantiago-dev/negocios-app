import Service from "./service.js";
import ventasRepository from "../repositories/ventas.rep.js";
import sendEmail from "../utils/mailing.util.js";
import informeDiarioEmail from "../utils/emails/informeDiarioEmail.js";
import cajaRepository from "../repositories/caja.rep.js";
import cajaService from "./caja.service.js";
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
        ref: String(venta._id ?? venta._id?.toString?.() ?? ""),
        operacion: "venta",
        fecha: venta.fecha ?? new Date(),
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
} = ventasService;
