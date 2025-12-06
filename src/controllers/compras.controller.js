import {
  createService,
  destroyService,
  paginateService,
  readOneService,
  readService,
  updateService,
} from "../services/compras.service.js";

class ComprasController {
  create = async (req, res, next) => {
    try {
      const data = req.body;
      const one = await createService(data);
      return res.exito201(one);
    } catch (error) {
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
  readOne = async (req, res, next) => {
    try {
      const { _id } = req.params;
      const one = await readOneService(_id);
      return res.exito200(one);
    } catch (error) {
      return next(error);
    }
  };
  read = async (req, res, next) => {
    try {
      const { title, category } = req.params;
      const data = { title, category };
      const one = await readService(data);
      return res.exito201(one);
    } catch (error) {
      return next(error);
    }
  };
  destroy = async (req, res, next) => {
    try {
      const { pid } = req.params;
      const one = await destroyService(pid);
      return res.exito200(one);
    } catch (error) {
      return next(error);
    }
  };
  paginate = async (req, res, next) => {
    try {
      const filter = {};
      const options = {};
      if (req.query.limit) {
        options.limit = req.query.limit;
      }
      if (req.query.page) {
        options.page = req.query.page;
      }
      if (req.query.user_id) {
        filter.user_id = req.query.user_id;
      }
      const all = await paginateService({ filter, options });
      const info = {
        page: all.page,
        limit: all.limit,
        prevPage: all.prevPage,
        nextPage: all.nextPage,
        totalPages: all.totalPages,
      };
      return res.paginate(all.docs, info);
    } catch (error) {
      return next(error);
    }
  };
}

const comprasController = new ComprasController();
const { create, read, readOne, destroy, update, paginate } = comprasController;
export { create, read, readOne, destroy, update, paginate };
