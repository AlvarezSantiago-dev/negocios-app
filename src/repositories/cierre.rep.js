import dao from "../data/dao.factory.js";
import CierreDTO from "../dto/cierre.dto.js";

const { cierres } = dao;

class CierreRepository {
  constructor(manager) {
    this.model = manager;
  }

  async crearCierre(data) {
    return await this.model.create(new CierreDTO(data));
  }

  async obtenerCierres() {
    // read() = equivalente correcto de readMany()
    return await this.model.Model.find();
  }

  async obtenerCierrePorFecha(fechaISO) {
    // tu Manager solo tiene readOne por _id, así que acá sí o sí hago un findOne
    return await this.model.Model.findOne({ fecha: fechaISO }).lean();
  }
  async existeCierreHoy(fechaISO) {
    // fechaISO = "YYYY-MM-DD"
    const inicio = new Date(`${fechaISO}T00:00:00.000-03:00`);
    const fin = new Date(`${fechaISO}T23:59:59.999-03:00`);

    const cierre = await this.model.Model.findOne({
      fecha: { $gte: inicio, $lte: fin },
    }).lean();

    return !!cierre;
  }
  async obtenerUltimos7Dias() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const desde = new Date(hoy);
    desde.setDate(desde.getDate() - 7);

    return await this.model.Model.find({
      fecha: { $gte: desde },
    })
      .sort({ fecha: -1 })
      .lean();
  }
}

const cierreRepository = new CierreRepository(cierres);
export default cierreRepository;
