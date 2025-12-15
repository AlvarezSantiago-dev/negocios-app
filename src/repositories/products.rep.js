import dao from "../data/dao.factory.js";
import ProductoDTO from "../dto/products.dto.js";
import { fechaCompletaArg } from "../utils/fecha.js";
const { products } = dao;
class ProductsRepository {
  constructor(manager) {
    this.model = manager;
  }
  createRepository = async (data) => {
    try {
      const dto = new ProductoDTO(data);

      // unicidad por nombre
      const existentes = await this.model.read({ nombre: dto.nombre });
      if (existentes?.length) {
        const err = new Error("Ya existe un producto con ese nombre");
        err.statusCode = 409;
        throw err;
      }

      // historial de compra inicial (opcional)
      if (data.cantidadCompra && dto.precioCompra >= 0) {
        dto.historialCompras = [
          {
            cantidad: Number(data.cantidadCompra),
            tipo: dto.tipo,
            precioCompraUnitario: dto.precioCompra,
            fecha: new Date(),
          },
        ];

        dto.stock = (dto.stock ?? 0) + Number(data.cantidadCompra);
      }

      return await this.model.create(dto);
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

      const dto = new ProductoDTO({
        ...existing,
        ...data,
      });

      // unicidad por nombre
      if (dto.nombre !== existing.nombre) {
        const encontrados = await this.model.read({ nombre: dto.nombre });
        const otros = encontrados.filter((p) => String(p._id) !== String(_id));
        if (otros.length) {
          const err = new Error("Ya existe otro producto con ese nombre");
          err.statusCode = 409;
          throw err;
        }
      }

      return await this.model.update(_id, dto);
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
  // productos.repository.js
  modificarStock = async (productoId, cantidad) => {
    return await this.model.update(
      productoId,
      { $inc: { stock: cantidad } },
      { new: true }
    );
  };
  async getByBarcode(code) {
    return await this.model.Model.findOne({ codigoBarras: code });
  }
}
const productsRepository = new ProductsRepository(products);
export default productsRepository;
