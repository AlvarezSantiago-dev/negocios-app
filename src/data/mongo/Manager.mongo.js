class Manager {
  constructor(Model) {
    this.Model = Model;
  }

  //esperar los tiempos de mongoose.
  async create(data) {
    try {
      const one = await this.Model.create(data); //create ya es un metodo de mongo
      return one;
    } catch (error) {
      throw error;
    }
  }
  async read(filter = {}) {
    try {
      const all = await this.Model.find(filter).lean();
      return all;
    } catch (error) {
      throw error;
    }
  }

  async paginate({ filter, options }) {
    try {
      const all = await this.Model.paginate(filter, options);
      return all;
    } catch (error) {
      throw error;
    }
  }
  async readOne(_id) {
    try {
      const one = await this.Model.findById(_id).lean(); //metodo de mongoose.
      //const one = await this.Model.findeOne({_id:id}) otro metodo
      return one;
    } catch (error) {
      throw error;
    }
  }
  async update(_id, data) {
    try {
      const one = await this.Model.findByIdAndUpdate(_id, data, { new: true }); // new true devuelve el objeto actualizado
      return one;
    } catch (error) {
      throw error;
    }
  }
  async destroy(_id) {
    try {
      const one = await this.Model.findByIdAndDelete(_id); //metodo de mongo/mongoose
      return one;
    } catch (error) {
      throw error;
    }
  }
  async readByEmail(email) {
    try {
      const one = await this.Model.findOne({ email }).lean();
      return one;
    } catch (error) {
      throw error;
    }
  }
  async aggregate(obj) {
    try {
      const result = await this.Model.aggregate(obj);
      return result;
    } catch (error) {
      throw error;
    }
  }
  async readByUserId(userId) {
    try {
      const one = await this.Model.find({ user_id: userId }).lean();
      return one;
    } catch (error) {
      throw error;
    }
  }
}
export default Manager;
