// src/repositories/ventas.rep.js
import dao from "../data/dao.factory.js";
import VentaDTO from "../dto/ventas.dto.js";
import { fechaCompletaArg } from "../utils/fecha.js";

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
      fecha: data.fecha || new Date(),
    });

    return await this.model.create(ventaDTO);
  };

  // 📌 Ventas del día
  ventasDiarias = async (fechaISO) => {
    // fechaISO: 'YYYY-MM-DD'
    const inicioAR = new Date(`${fechaISO}T00:00:00-03:00`);
    const finAR = new Date(`${fechaISO}T23:59:59.999-03:00`);

    // Devolver objetos simples con .lean()
    return await this.model.Model.find({
      fecha: { $gte: inicioAR, $lte: finAR },
    }).lean();
  };

  // 📌 Ventas del mes
  ventasMensuales = async (year, month) => {
    // month: 1..12
    const inicioAR = new Date(
      `${year}-${String(month).padStart(2, "0")}-01T00:00:00-03:00`
    );

    const ultimoDia = new Date(year, month, 0).getDate();
    const finAR = new Date(
      `${year}-${String(month).padStart(
        2,
        "0"
      )}-${ultimoDia}T23:59:59.999-03:00`
    );

    return await this.model.Model.find({
      fecha: { $gte: inicioAR, $lte: finAR },
    }).lean();
  };

  // 📌 Ganancias: día o mes depende de filtros
  ganancias = async ({ year, month, day }) => {
    let inicioAR, finAR;

    if (day) {
      inicioAR = new Date(
        `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
          2,
          "0"
        )}T00:00:00-03:00`
      );
      finAR = new Date(
        `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
          2,
          "0"
        )}T23:59:59.999-03:00`
      );
    } else {
      inicioAR = new Date(
        `${year}-${String(month).padStart(2, "0")}-01T00:00:00-03:00`
      );
      const ultimoDia = new Date(year, month, 0).getDate();
      finAR = new Date(
        `${year}-${String(month).padStart(2, "0")}-${String(ultimoDia).padStart(
          2,
          "0"
        )}T23:59:59.999-03:00`
      );
    }
    // Retornar agregación con totales
    const inicioUTC = inicioAR;
    const finUTC = finAR;

    const agg = await this.model.Model.aggregate([
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

    return agg; // array (puede estar vacío) -> controller toma agg[0] || {}
  };

  // ventas.repository.js
  ultimos7Dias = async () => {
    const hoy = new Date();
    const hace7 = new Date();
    hace7.setDate(hoy.getDate() - 6); // incluye hoy

    const inicio = new Date(
      hace7.toLocaleString("en-US", {
        timeZone: "America/Argentina/Buenos_Aires",
      })
    );
    const fin = new Date(
      hoy.toLocaleString("en-US", {
        timeZone: "America/Argentina/Buenos_Aires",
      })
    );

    return await this.model.Model.find({
      fecha: { $gte: inicio, $lte: fin },
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
