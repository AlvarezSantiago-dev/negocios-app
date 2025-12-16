// src/repositories/ventas.rep.js
import dao from "../data/dao.factory.js";
import VentaDTO from "../dto/ventas.dto.js";
import rangoDiaUTC from "../utils/rangoDiaUtc.js";

const { ventas, products: productos } = dao; // products viene de dao.factory.js

class VentasRepository {
  constructor(manager) {
    this.model = manager;
  }

  // data: { items: [{ productoId, cantidad, precioVenta? }], metodoPago?, fecha? }
  createRepository = async (data) => {
    const items = data.items;
    const round2 = (n) => Math.round(n * 100) / 100;

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("La venta debe tener al menos un producto.");
    }

    let totalVenta = 0;
    let gananciaTotal = 0;
    const procesados = [];

    for (const it of items) {
      const producto = await productos.readOne(it.productoId);
      if (!producto) {
        throw new Error("Producto no encontrado.");
      }

      const cantidad = Number(it.cantidad);
      if (!Number.isFinite(cantidad) || cantidad <= 0) {
        throw new Error("Cantidad inválida.");
      }

      // ------------------------------
      // VALIDACIÓN STOCK (NO PESO)
      // ------------------------------
      if (producto.tipo !== "peso") {
        if (producto.stock < cantidad) {
          throw new Error(
            `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`
          );
        }
      }

      // ------------------------------
      // PRECIO VENTA UNITARIO
      // ------------------------------
      let precioVentaUnit = producto.precioVenta;

      // Packs automáticos
      if (Array.isArray(producto.packs) && producto.packs.length > 0) {
        const pack = producto.packs.find(
          (p) => Number(p.unidades) === cantidad
        );

        if (pack) {
          precioVentaUnit = pack.precioVentaPack / cantidad;
        }
      }

      // ------------------------------
      // PRECIO COMPRA UNITARIO
      // ------------------------------
      const precioCompraUnit = producto.precioCompra ?? 0;

      // ------------------------------
      // DESCONTAR STOCK
      // ------------------------------
      if (producto.tipo === "peso") {
        const nuevoStock = Number((producto.stock - cantidad).toFixed(3));

        if (nuevoStock < 0) {
          throw new Error(
            `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`
          );
        }

        await productos.update(producto._id, {
          stock: nuevoStock,
        });
      } else {
        await productos.update(producto._id, {
          stock: producto.stock - cantidad,
        });
      }

      // ------------------------------
      // CÁLCULOS
      // ------------------------------
      const precioVentaUnitFinal = round2(precioVentaUnit);
      const precioCompraUnitFinal = round2(precioCompraUnit);

      const subtotal = round2(precioVentaUnitFinal * cantidad);
      const ganancia = round2(
        (precioVentaUnitFinal - precioCompraUnitFinal) * cantidad
      );

      totalVenta = round2(totalVenta + subtotal);
      gananciaTotal = round2(gananciaTotal + ganancia);

      procesados.push({
        productoId: producto._id,
        cantidad,
        precioVenta: precioVentaUnitFinal,
        precioCompra: precioCompraUnitFinal,
        subtotal,
      });
    }

    // ------------------------------
    // FECHA ARGENTINA
    // ------------------------------

    const ventaDTO = new VentaDTO({
      items: procesados,
      metodoPago: data.metodoPago || "efectivo",
      totalVenta,
      gananciaTotal,
      fecha: data.fecha ?? new Date(),
    });

    return await this.model.create(ventaDTO);
  };

  // 📌 Ventas del día
  async ventasDiarias(fechaInicio, fechaFin) {
    return await this.model.Model.find({
      fecha: {
        $gte: fechaInicio,
        $lte: fechaFin,
      },
    }).sort({ fecha: 1 });
  }

  // 📌 Ventas del mes
  ventasMensuales = async (year, month) => {
    const inicioUTC = new Date(Date.UTC(year, month - 1, 1, 3, 0, 0, 0));
    const finUTC = new Date(Date.UTC(year, month, 1, 2, 59, 59, 999));

    return await this.model.Model.find({
      fecha: { $gte: inicioUTC, $lte: finUTC },
    }).lean();
  };

  // 📌 Ganancias: día o mes depende de filtros
  ganancias = async ({ year, month, day }) => {
    let inicioUTC, finUTC;

    if (day) {
      ({ inicio: inicioUTC, fin: finUTC } = rangoDiaUTC(year, month, day));
    } else {
      // mes completo
      const inicioMes = new Date(Date.UTC(year, month - 1, 1, 3, 0, 0, 0));
      const finMes = new Date(Date.UTC(year, month, 1, 2, 59, 59, 999));
      inicioUTC = inicioMes;
      finUTC = finMes;
    }

    return await this.model.Model.aggregate([
      { $match: { fecha: { $gte: inicioUTC, $lte: finUTC } } },
      {
        $group: {
          _id: null,
          totalGanado: { $sum: "$gananciaTotal" },
          totalVendido: { $sum: "$totalVenta" },
          cantidadVentas: { $sum: 1 },
        },
      },
    ]);
  };

  // ventas.repository.js
  ultimos7Dias = async () => {
    const hoy = new Date();

    // hoy AR
    const year = hoy.getUTCFullYear();
    const month = hoy.getUTCMonth() + 1;
    const day = hoy.getUTCDate();

    const { inicio: inicioHoyUTC, fin: finHoyUTC } = rangoDiaUTC(
      year,
      month,
      day
    );

    const inicio = new Date(inicioHoyUTC);
    inicio.setUTCDate(inicio.getUTCDate() - 6);

    return await this.model.Model.find({
      fecha: { $gte: inicio, $lte: finHoyUTC },
    }).lean();
  };

  readRepository = async () => {
    try {
      return await this.model.read();
    } catch (error) {
      throw error;
    }
  };

  readOneRepository = async (_id) => {
    try {
      return await this.model.readOne(_id);
    } catch (error) {
      throw error;
    }
  };

  updateRepository = async (_id, data) => {
    try {
      return await this.model.update(_id, data);
    } catch (error) {
      throw error;
    }
  };

  destroyRepository = async (_id) => {
    try {
      return await this.model.destroy(_id);
    } catch (error) {
      throw error;
    }
  };

  paginateRepository = async ({ filter = {}, options = {} }) => {
    try {
      return await this.model.paginate({ filter, options });
    } catch (error) {
      throw error;
    }
  };
}

const ventasRepository = new VentasRepository(ventas);
export default ventasRepository;
