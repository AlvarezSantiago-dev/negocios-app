import ventasRepository from "../repositories/ventas.rep.js";
import ventasService from "../services/ventas.service.js";
class VentasController {
  create = async (req, res, next) => {
    try {
      const data = req.body;
      const venta = await ventasService.crearVentaConLogica(data);
      return res.exito201(venta);
    } catch (error) {
      return next(error);
    }
  };

  read = async (req, res, next) => {
    try {
      const all = await ventasService.readService();
      return res.exito200(all);
    } catch (error) {
      return next(error);
    }
  };

  readOne = async (req, res, next) => {
    try {
      const { _id } = req.params;
      const one = await ventasService.readOneService(_id);
      return res.exito200(one);
    } catch (error) {
      return next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { _id } = req.params;
      const data = req.body;
      const one = await ventasService.updateService(_id, data);
      return res.exito200(one);
    } catch (error) {
      return next(error);
    }
  };
  destroy = async (req, res, next) => {
    try {
      const { _id } = req.params;
      const one = await ventasService.destroyService(_id);
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
      const all = await ventasService.paginateService({ filter, options });
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
  getVentasDiarias = async (req, res) => {
    try {
      const { fecha } = req.query; // formato ISO: 2025-11-23
      const data = await ventasService.ventasDiariasService(fecha);
      res.json({ ventas: data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  getVentasMensuales = async (req, res) => {
    try {
      const { year, month } = req.query;
      const data = await ventasService.ventasMensualesService(
        parseInt(year),
        parseInt(month)
      );
      res.json({ ventas: data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  getGanancias = async (req, res) => {
    try {
      const { year, month, day } = req.query;

      const data = await ventasService.gananciasService({
        year: parseInt(year),
        month: parseInt(month),
        day: day ? parseInt(day) : null,
      });

      res.json({ ganancias: data[0] || {} });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  getUltimos7Dias = async (req, res) => {
    try {
      const ventas = await ventasRepository.ultimos7Dias();

      return res.status(200).send({
        statusCode: 200,
        ventas,
      });
    } catch (err) {
      console.log("Error en getUltimos7Dias:", err);
      return res.status(500).send({
        statusCode: 500,
        error: "Error obteniendo ventas de los últimos 7 días",
      });
    }
  };
}

const ventasController = new VentasController();
const {
  create,
  read,
  readOne,
  destroy,
  update,
  paginate,
  getGanancias,
  getVentasDiarias,
  getVentasMensuales,
  getUltimos7Dias,
} = ventasController;
export {
  create,
  destroy,
  getGanancias,
  getUltimos7Dias,
  getVentasDiarias,
  getVentasMensuales,
  paginate,
  read,
  readOne,
  update,
};
