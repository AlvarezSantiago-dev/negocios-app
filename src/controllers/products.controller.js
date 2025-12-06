import {
  createService,
  readService,
  readOneService,
  updateService,
  destroyService,
  paginateService,
  updateStockService,
  obtenerPrecioCompraUnitarioService,
} from "../services/products.service.js";
class ProductsController {
  create = async (req, res, next) => {
    try {
      const data = req.body;
      const one = await createService(data);
      return res.exito201(one);
    } catch (error) {
      return next(error);
    }
  };
  read = async (req, res, next) => {
    try {
      const filter = req.query || {};
      const all = await readService(filter);
      return res.exito200(all);
    } catch (error) {
      return next(error);
    }
  };
  readOne = async (req, res, next) => {
    try {
      const { _id } = req.params;
      const one = await readOneService(_id);
      return res.exito200(one);
    } catch (error) {
      8;
      return next(error);
    }
  };
  update = async (req, res, next) => {
    try {
      const { _id } = req.params;
      const data = req.body;
      const one = await updateService(_id, data);
      return res.exito200(one);
    } catch (error) {
      return next(error);
    }
  };
  destroy = async (req, res, next) => {
    try {
      const { _id } = req.params;
      const one = await destroyService(_id);
      return res.exito200(one);
    } catch (error) {
      return next(error);
    }
  };
  paginate = async (req, res, next) => {
    try {
      const filter = {};
      const options = {};
      if (req.query.limit) options.limit = req.query.limit;
      if (req.query.page) options.page = req.query.page;
      const all = await paginateService({ filter, options });
      return res.paginate(all.docs, {
        page: all.page,
        totalPages: all.totalPages,
        prevPage: all.prevPage,
        nextPage: all.nextPage,
      });
    } catch (error) {
      return next(error);
    }
  };
  // Ajustar stock con delta (delta en UNIDADES: positivo para sumar, negativo para restar)
  adjustStock = async (req, res, next) => {
    try {
      const { _id } = req.params;
      const { delta } = req.body; // number
      const updated = await updateStockService(_id, Number(delta));
      return res.exito200(updated);
      9;
    } catch (error) {
      return next(error);
    }
  };
  // Comprar packs/unidades -> endpoint util para recibir mercadería
  purchase = async (req, res, next) => {
    try {
      const { _id } = req.params;
      // body: { cantidad: number, unidad: 'pack'|'unidad' }
      const { cantidad, unidad } = req.body;
      if (!cantidad || cantidad <= 0) return res.error400("cantidad inválida");
      const prod = await readOneService(_id);
      if (!prod) return res.error404();
      let unidadesAgregadas = 0;
      if (unidad === "pack") {
        if (!prod.unidadPorPack)
          return res.error400("Producto no tiene unidadPorPack");
        unidadesAgregadas = Number(cantidad) * Number(prod.unidadPorPack);
      } else {
        unidadesAgregadas = Number(cantidad);
      }
      const updated = await updateStockService(_id, unidadesAgregadas);
      return res.exito200(updated);
    } catch (error) {
      return next(error);
    }
  };
  // Vender: resta stock (cantidad + unidad similar a purchase)
  sell = async (req, res, next) => {
    try {
      const { _id } = req.params;
      // body: { cantidad: number, unidad: 'pack'|'unidad' }
      const { cantidad, unidad } = req.body;
      if (!cantidad || cantidad <= 0) return res.error400("cantidad inválida");
      const prod = await readOneService(_id);
      if (!prod) return res.error404();
      let unidadesARestar = 0;
      if (unidad === "pack") {
        if (!prod.unidadPorPack)
          return res.error400("Producto no tiene unidadPorPack");
        unidadesARestar = Number(cantidad) * Number(prod.unidadPorPack);
      } else {
        unidadesARestar = Number(cantidad);
      }
      const updated = await updateStockService(_id, -unidadesARestar);
      return res.exito200(updated);
    } catch (error) {
      return next(error);
    }
  };
}
const productsController = new ProductsController();
const {
  create,
  read,
  readOne,
  update,
  destroy,
  paginate,
  adjustStock,
  purchase,
  sell,
} = productsController;
export {
  create,
  read,
  readOne,
  update,
  destroy,
  paginate,
  adjustStock,
  purchase,
  sell,
};
