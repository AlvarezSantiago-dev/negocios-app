import fs from "fs";
import crypto from "crypto";

class ProductsManager {
  constructor() {
    this.path = "./src/data/fs/files/products.json";
    this.init();
  }

  init() {
    const existe = fs.existsSync(this.path);
    if (!existe) {
      const stringData = JSON.stringify([], null, 2);
      fs.writeFileSync(this.path, stringData);
      console.log("Archivo creado");
    } else {
      console.log("Archivo ya existe");
    }
  }

  async create(data) {
    try {
      /*SE ENCARGA EL DTO DE PRODUCTS */
      /*
      const product = {
        product_id: crypto.randomBytes(12).toString("hex"),
        title: data.title,
        photo: data.photo || "url-fotodefault",
        category: data.category || "to do",
        price: data.price,
        stock: data.stock || 1,
        email: data.email || null, // agregado para compatibilidad con readByEmail
        user_id: data.user_id || null, // agregado para compatibilidad con readByUserId
      };
      */
      let all = await fs.promises.readFile(this.path, "utf-8");
      all = JSON.parse(all);
      all.push(data);
      await fs.promises.writeFile(this.path, JSON.stringify(all, null, 2));
      return data;
    } catch (error) {
      throw error;
    }
  }

  async read(category) {
    try {
      let all = await fs.promises.readFile(this.path, "utf-8");
      all = JSON.parse(all);
      if (category) {
        all = all.filter((e) => e.category === category);
      }
      return all;
    } catch (error) {
      throw error;
    }
  }

  async readOne(id) {
    try {
      let all = await fs.promises.readFile(this.path, "utf-8");
      all = JSON.parse(all);
      const one = all.find((e) => e._id === id);
      if (!one) throw new Error("Not found");
      return one;
    } catch (error) {
      throw error;
    }
  }

  async update(id, data) {
    try {
      let all = await fs.promises.readFile(this.path, "utf-8");
      all = JSON.parse(all);
      let one = all.find((element) => element._id === id);
      if (one) {
        for (let prop in data) {
          one[prop] = data[prop];
        }
        all = JSON.stringify(all, null, 2);
        await fs.promises.writeFile(this.path, all);
        return one;
      } else {
        const error = new Error("Not Found!");
        error.statusCode = 404;
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }
  async destroy(_id) {
    try {
      let array = await fs.promises.readFile(this.path, "utf-8");
      array = JSON.parse(array);

      let one = array.find((element) => element._id === _id);
      if (!one) {
        const error = new Error("Not found!");
        error.statusCode = 404;
        throw error;
      }

      let filtered = array.filter((element) => element._id !== _id);

      // guardás string en el archivo
      await fs.promises.writeFile(this.path, JSON.stringify(filtered, null, 2));

      return one; // 👈 devolvés el objeto eliminado
    } catch (error) {
      throw error;
    }
  }

  async readByEmail(email) {
    try {
      let all = await fs.promises.readFile(this.path, "utf-8");
      all = JSON.parse(all);
      return all.find((e) => e.email === email) || null;
    } catch (error) {
      throw error;
    }
  }

  async readByUserId(userId) {
    try {
      let all = await fs.promises.readFile(this.path, "utf-8");
      all = JSON.parse(all);
      return all.filter((e) => e.user_id === userId);
    } catch (error) {
      throw error;
    }
  }

  async paginate({ filter = {}, options = {} }) {
    try {
      let all = await this.read();
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
    } catch (error) {
      throw error;
    }
  }

  async aggregate(pipeline) {
    // No es Mongo, así que hacemos algo simple
    try {
      let all = await this.read();
      // Por simplicidad devolvemos todo; se puede agregar lógica de filtros
      return all;
    } catch (error) {
      throw error;
    }
  }
}

const productsManager = new ProductsManager();
export default productsManager;
