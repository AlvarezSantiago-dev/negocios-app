import crypto from "crypto";

class ComprasManager {
  constructor() {
    this.compras = [];
  }

  async create(data) {
    this.compras.push(data);
    return data;
  }

  async read() {
    return this.compras;
  }

  async readOne(id) {
    const one = this.compras.find((c) => c.cart_id === id);
    if (!one) throw new Error("Not found");
    return one;
  }

  async update(id, data) {
    const index = this.compras.findIndex((c) => c.cart_id === id);
    if (index === -1) throw new Error("Not found");

    this.compras[index] = { ...this.compras[index], ...data };
    return this.compras[index];
  }

  async destroy(id) {
    const index = this.compras.findIndex((c) => c.cart_id === id);
    if (index === -1) throw new Error("Not found");

    const deleted = this.compras.splice(index, 1);
    return deleted[0];
  }

  async readByUserId(userId) {
    return this.compras.filter((c) => c.user_id === userId);
  }

  async paginate({ filter = {}, options = {} }) {
    let all = this.compras;
    if (filter.user_id) {
      all = all.filter((c) => c.user_id === filter.user_id);
    }
    const page = options.page || 1;
    const limit = options.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      docs: all.slice(start, end),
      totalDocs: all.length,
      limit,
      page,
      totalPages: Math.ceil(all.length / limit),
    };
  }

  async aggregate(pipeline) {
    // Simulación
    return this.compras;
  }
}

const comprasManager = new ComprasManager();
export default comprasManager;
