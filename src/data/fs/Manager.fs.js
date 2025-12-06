import fs from "fs"; //modulo nativo de js
import crypto from "crypto"; //modulo nativo de js

class Manager {
  constructor(Model) {
    this.Model = Model;
    this.path = "./src/data/fs/files/products.json"; //ruta del archivo
    this.init(); //funcion sincrona inicializadora construye la instancia
  }
  init() {
    const existe = fs.existsSync(this.path);
    if (!existe) {
      const stringData = JSON.stringify([], null, 2);
      fs.writeFileSync(this.path, stringData);
      console.log("archivo creado");
    } else {
      console.log("archivo ya existe");
    }
  }
  async create(data) {
    try {
      if (!data.title) {
        const error = new Error("complete todos los campos");
        error.statusCode = 404;
        throw error;
      } else {
        const product = {
          product_id: crypto.randomBytes(12).toString("hex"),
          title: data.title,
          photo: data.photo || "url-fotodefault",
          category: data.category || "to do",
          price: data.price,
          stock: data.stock || 1,
        };
        let todos = await fs.promises.readFile(this.path, "utf-8");
        todos = JSON.parse(todos);
        todos.push(product);
        todos = JSON.stringify(todos, null, 2);
        await fs.promises.writeFile(this.path, todos);
        console.log("creado");
        console.log(product);
        return product;
      }
    } catch (error) {
      throw error;
    }
  }
  async read(category = "zapatilla") {
    try {
      let all = await fs.promises.readFile(this.path, "utf-8");
      all = JSON.parse(all);
      all = all.filter((element) => element.category === category);
      if (all.length === 0) {
        console.log("es null");

        return null;
      } else {
        return all;
      }
    } catch (error) {
      console.log(error);
    }
  }
  async readOne(id) {
    try {
      let array = await fs.promises.readFile(this.path, "utf-8");
      array = JSON.parse(array);
      let one = array.find((element) => element.product_id === id);
      if (!one) {
        const error = new Error("Not Found");
        error.statusCode = 404;
        throw error;
      } else {
        return one;
      }
    } catch (error) {
      throw error;
    }
  }
  async update(id, data) {
    try {
      let all = await fs.promises.readFile(this.path, "utf-8");
      all = JSON.parse(all);
      let one = all.find((element) => element.product_id === id);
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
  async destroy(id) {
    try {
      let array = await fs.promises.readFile(this.path, "utf-8");
      array = JSON.parse(array);
      let one = await array.find((element) => element.product_id === id);
      if (!one) {
        const error = new Error("Not found!");
        error.statusCode = 404;
        throw error;
      } else {
        let filtered = await array.filter(
          (element) => element.product_id !== id
        );
        filtered = JSON.stringify(filtered, null, 2);
        await fs.promises.writeFile(this.path, filtered);
        console.log(one, "Eliminamos este");
        return filtered;
      }
    } catch (error) {
      throw error;
    }
  }
}

export default Manager;
