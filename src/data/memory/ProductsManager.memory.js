import crypto from "crypto";

class ProductsManagerMemory {
  constructor() {
    this.products = [];
  }

  async create(data) {
    this.products.push(data);
    return data;
  }

  async read(category) {
    if (category) {
      return this.products.filter((e) => e.category === category);
    }
    return this.products;
  }

  async readOne(id) {
    const one = this.products.find((e) => e._id === id);
    if (!one) throw new Error("Not found");
    return one;
  }

  async update(id, data) {
    const index = this.products.findIndex((e) => e._id === id);
    if (index === -1) throw new Error("Not found");
    this.products[index] = { ...this.products[index], ...data };
    return this.products[index];
  }

  async destroy(id) {
    const index = this.products.findIndex((e) => e._id === id);
    if (index === -1) throw new Error("Not found");
    const deleted = this.products.splice(index, 1);
    return deleted[0];
  }

  async readByEmail(email) {
    return this.products.find((e) => e.email === email) || null;
  }

  async readByUserId(userId) {
    return this.products.filter((e) => e._id === userId);
  }

  async paginate({ filter = {}, options = {} }) {
    let all = this.products;
    if (filter.category) {
      all = all.filter((e) => e.category === filter.category);
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
    // Igual que FS: devolvemos todo por simplicidad
    return this.products;
  }
}

const productsManagerMemory = new ProductsManagerMemory();
export default productsManagerMemory;
