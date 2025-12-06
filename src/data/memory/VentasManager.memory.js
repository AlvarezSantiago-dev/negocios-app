import crypto from "crypto";

class VentasManager {
  constructor() {
    this.ventas = [];
  }

  async create(data) {
    this.ventas.push(data);
    return data;
  }

  async read() {
    return this.ventas;
  }

  async readOne(id) {
    const one = this.ventas.find((c) => c.cart_id === id);
    if (!one) throw new Error("Not found");
    return one;
  }

  async update(id, data) {
    const index = this.ventas.findIndex((c) => c.cart_id === id);
    if (index === -1) throw new Error("Not found");

    this.ventas[index] = { ...this.ventas[index], ...data };
    return this.ventas[index];
  }

  async destroy(id) {
    const index = this.ventas.findIndex((c) => c.cart_id === id);
    if (index === -1) throw new Error("Not found");

    const deleted = this.ventas.splice(index, 1);
    return deleted[0];
  }

  async readByUserId(userId) {
    return this.ventas.filter((c) => c.user_id === userId);
  }

  async paginate({ filter = {}, options = {} }) {
    let all = this.ventas;
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
    return this.ventas;
  }
}

const ventasManager = new VentasManager();
export default ventasManager;
