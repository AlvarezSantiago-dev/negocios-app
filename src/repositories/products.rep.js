import dao from "../data/dao.factory.js";
import ProductoDTO from "../dto/products.dto.js";
const { products } = dao;
class ProductsRepository {
  constructor(manager) {
    this.model = manager;
  }
  createRepository = async (data) => {
    try {
      const incoming = { ...data };
      // Si es pack y frontend envía stock en packs, convertimos a unidades
      if (
        incoming.tipo === "pack" &&
        incoming.unidadPorPack &&
        incoming.stock
      ) {
        incoming.stock =
          Number(incoming.stock) * Number(incoming.unidadPorPack);
      }
      // calcular precioCompra si es pack (DTO también lo hace)
      const dto = new ProductoDTO(incoming);
      // unicidad nombre+tipo
      const existentes = await this.model.read({
        nombre: dto.nombre,
        tipo: dto.tipo,
      });
      if (Array.isArray(existentes) && existentes.length > 0) {
        const err = new Error("Ya existe un producto con ese nombre y tipo");
        err.statusCode = 404;
        throw err;
      }
      // historial / stock por compra opcional
      if (data.cantidadCompra && (dto.precioCompra || dto.precioCompra === 0)) {
        dto.historialCompras = dto.historialCompras || [];
        dto.historialCompras.push({
          cantidad:
            Number(data.cantidadCompra) *
            (data.tipo === "pack" && data.unidadPorPack
              ? Number(data.unidadPorPack)
              : 1),
          tipo: dto.tipo,
          precioCompraUnitario: dto.precioCompra,
          fecha: new Date(),
        });
        dto.stock =
          (dto.stock ?? 0) +
          Number(data.cantidadCompra) *
            (data.tipo === "pack" && data.unidadPorPack
              ? Number(data.unidadPorPack)
              : 1);
      }
      const one = await this.model.create(dto);
      return one;
    } catch (error) {
      throw error;
    }
  };
  readRepository = async (filter = {}) => {
    try {
      const all = await this.model.read(filter);
      return all;
    } catch (error) {
      throw error;
    }
  };
  readOneRepository = async (_id) => {
    try {
      const one = await this.model.readOne(_id);
      return one;
    } catch (error) {
      throw error;
    }
  };
  updateRepository = async (_id, data) => {
    try {
      const existing = await this.model.readOne(_id);
      if (!existing) {
        const e = new Error("Producto no encontrado");
        e.statusCode = 404;
        throw e;
      }
      const incoming = { ...data };
      if (incoming.tipo && incoming.tipo !== existing.tipo) {
        if (incoming.tipo === "pack") {
          if (incoming.precioCompraPack && incoming.unidadPorPack) {
            incoming.precioCompra =
              incoming.precioCompraPack / incoming.unidadPorPack;
          }
        } else if (incoming.tipo === "unitario" || incoming.tipo === "peso") {
          incoming.precioCompraPack = undefined;
          incoming.unidadPorPack = undefined;
        }
      } else {
        if (
          (incoming.tipo === "pack" || existing.tipo === "pack") &&
          (incoming.precioCompraPack || incoming.unidadPorPack)
        ) {
          const precioCompraPack =
            incoming.precioCompraPack ?? existing.precioCompraPack;
          const unidadPorPack =
            incoming.unidadPorPack ?? existing.unidadPorPack;
          if (precioCompraPack != null && unidadPorPack) {
            incoming.precioCompra = precioCompraPack / unidadPorPack;
          }
        }
      }
      const newNombre = incoming.nombre ?? existing.nombre;
      const newTipo = incoming.tipo ?? existing.tipo;
      if (newNombre !== existing.nombre || newTipo !== existing.tipo) {
        const encontrados = await this.model.read({
          nombre: newNombre,
          tipo: newTipo,
        });
        const otros = Array.isArray(encontrados)
          ? encontrados.filter((p) => String(p._id) !== String(_id))
          : [];
        if (otros.length > 0) {
          const err = new Error(
            "Ya existe otro producto con ese nombre y tipo"
          );
          err.statusCode = 409;
          throw err;
        }
      }
      if (
        incoming.tipo === "pack" &&
        incoming.unidadPorPack &&
        incoming.stock
      ) {
        incoming.stock =
          Number(incoming.stock) * Number(incoming.unidadPorPack);
      }
      const one = await this.model.update(_id, incoming);
      return one;
    } catch (error) {
      throw error;
    }
  };
  destroyRepository = async (_id) => {
    try {
      const one = await this.model.destroy(_id);
      return one;
    } catch (error) {
      throw error;
    }
  };
  paginateRepository = async ({ filter = {}, options = {} }) => {
    try {
      const all = await this.model.paginate({ filter, options });
      return all;
    } catch (error) {
      throw error;
    }
  };
  updateStockRepository = async (productoId, delta) => {
    try {
      const producto = await this.model.readOne(productoId);
      if (!producto) {
        const e = new Error("Producto no encontrado");
        e.statusCode = 404;
        throw e;
      }
      const nuevoStock = Number(producto.stock ?? 0) + Number(delta);
      const stockFinal = nuevoStock < 0 ? 0 : nuevoStock;
      const updated = await this.model.update(productoId, {
        stock: stockFinal,
      });
      return updated;
    } catch (error) {
      throw error;
    }
  };
  obtenerPrecioCompraUnitario = async (productoId) => {
    try {
      const producto = await this.model.readOne(productoId);
      if (!producto) {
        const e = new Error("Producto no encontrado");
        e.statusCode = 404;
        throw e;
      }
      if (
        producto.tipo === "pack" &&
        producto.precioCompraPack &&
        producto.unidadPorPack
      ) {
        return (
          Number(producto.precioCompraPack) / Number(producto.unidadPorPack)
        );
      }
      return Number(producto.precioCompra ?? 0);
    } catch (error) {
      throw error;
    }
  };
}
const productsRepository = new ProductsRepository(products);
export default productsRepository;
