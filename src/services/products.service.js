import Service from "./service.js";
import productsRepository from "../repositories/products.rep.js";
const productsService = new Service(productsRepository);
const {
  createService,
  readService,
  readOneService,
  updateService,
  destroyService,
  paginateService,
} = productsService;
// wrappers adicionales:
const updateStockService = async (productoId, delta) => {
  try {
    return await productsRepository.updateStockRepository(productoId, delta);
  } catch (error) {
    throw error;
  }
};
const obtenerPrecioCompraUnitarioService = async (productoId) => {
  try {
    return await productsRepository.obtenerPrecioCompraUnitario(productoId);
  } catch (error) {
    throw error;
  }
};
export {
  createService,
  readService,
  readOneService,
  updateService,
  destroyService,
  paginateService,
  updateStockService,
  obtenerPrecioCompraUnitarioService,
};
export default productsService;
