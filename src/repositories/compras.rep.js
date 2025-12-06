import dao from "../data/dao.factory.js";
import CompraDTO from "../dto/compras.dto.js";

const { compras } = dao;

class ComprasRepository {
  constructor(manager) {
    this.model = manager;
  }
  //solo para el create ahora tiene que aplicar una transformacion
  createRepository = async (data) => {
    try {
      data = new CompraDTO(data);
      const one = await this.model.create(data);
      return one;
    } catch (error) {
      throw error; // se lo envio al next del controllador
    }
  };

  readRepository = async () => {
    try {
      const all = await this.model.read();
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
      const one = await this.model.update(_id, data);
      return one;
    } catch (error) {
      throw error;
    }
  };
  destroyRepository = async (id) => {
    try {
      const one = await this.model.destroy(id);
      return one;
    } catch (error) {
      throw error;
    }
  };
  paginateRepository = async ({ options }) => {
    try {
      const all = await this.model.paginate({ options });
      return all;
    } catch (error) {
      throw error;
    }
  };
}

const comprasRepository = new ComprasRepository(compras);
export default comprasRepository;
