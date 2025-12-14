import dao from "../data/dao.factory.js";
import CierreDTO from "../dto/cierre.dto.js";
import { fechaCompletaArg } from "../utils/fecha.js";

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
  async obtenerPorId(id) {
    // read() = equivalente correcto de readMany()
    return await this.model.Model.findById(id);
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
  //nuevas 2 funciones.
  async existeCierreActivoHoy(fechaISO) {
    const inicio = new Date(`${fechaISO}T00:00:00.000-03:00`);
    const fin = new Date(`${fechaISO}T23:59:59.999-03:00`);

    return await this.model.Model.exists({
      fecha: { $gte: inicio, $lte: fin },
      estado: "activo",
    });
  }
  async anularCierre(id, data) {
    return await this.model.Model.findByIdAndUpdate(
      id,
      {
        estado: "anulado",
        anuladoPor: data.anuladoPor,
        anuladoMotivo: data.anuladoMotivo,
        anuladoAt: new Date(),
      },
      { new: true }
    );
  }
}

const cierreRepository = new CierreRepository(cierres);
export default cierreRepository;
