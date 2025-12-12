class Service {
  constructor(repository) {
    this.repository = repository;
  }
  createService = async (data) => {
    try {
      const one = await this.repository.createRepository(data);
      return one;
    } catch (error) {
      throw error; // se lo envio al next del controllador
    }
  };

  readService = async (filter = {}) => {
    try {
      const all = await this.repository.readRepository(filter);
      return all;
    } catch (error) {
      throw error;
    }
  };
  readByBarcodeRepository(codigo) {
    return this.model.findOne({ codigoBarras: codigo });
  }

  readOneService = async (_id) => {
    try {
      const one = await this.repository.readOneRepository(_id);
      return one;
    } catch (error) {
      throw error;
    }
  };
  updateService = async (_id, data) => {
    try {
      const one = await this.repository.updateRepository(_id, data);
      return one;
    } catch (error) {
      throw error;
    }
  };
  destroyService = async (_id) => {
    try {
      const one = await this.repository.destroyRepository(_id);
      return one;
    } catch (error) {
      throw error;
    }
  };
  paginateService = async ({ options }) => {
    try {
      const all = await this.repository.paginateRepository({ options });
      return all;
    } catch (error) {
      throw error;
    }
  };
}

export default Service;
