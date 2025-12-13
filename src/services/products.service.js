import Service from "./service.js";
import productsRepository from "../repositories/products.rep.js";
import validarCodigoBarrasUnico from "../utils/validarCodigoBarrasUnico.js";
const productsService = new Service(productsRepository);
const { readService, readOneService, destroyService, paginateService } =
  productsService;
// wrappers adicionales:
const createService = async (data) => {
  await validarCodigoBarrasUnico(productsRepository, data.codigoBarras);

  return await productsRepository.createRepository(data);
};
const updateService = async (_id, data) => {
  await validarCodigoBarrasUnico(productsRepository, data.codigoBarras, _id);

  return await productsRepository.updateRepository(_id, data);
};

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
const getByIdService = async (id) => {
  return await productsRepository.getById(id);
};

// NUEVO
const getByBarcodeService = async (code) => {
  if (!code || typeof code !== "string") {
    throw new Error("Código de barras inválido");
  }

  const prod = await productsRepository.getByBarcode(code);
  if (!prod) {
    throw new Error("Producto no encontrado");
  }

  return prod;
};

export {
  getByIdService,
  getByBarcodeService,
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
