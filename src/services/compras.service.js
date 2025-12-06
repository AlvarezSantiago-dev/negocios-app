import Service from "./service.js";

import comprasRepository from "../repositories/compras.rep.js";

const comprasService = new Service(comprasRepository);
const {
  createService,
  readService,
  readOneService,
  updateService,
  destroyService,
  paginateService,
} = comprasService;

export {
  createService,
  readOneService,
  updateService,
  destroyService,
  paginateService,
  readService,
};
