// METODO FACTORY SE PUEDE APLICAR A MUCHAS COSAS.
import argsUtil from "../utils/args.util.js";

import dbConnect from "../utils/dbConnectMongoose.js";

const persistence = argsUtil.persistence; //
let dao = {}; //objeto a cargar dinamicamente con las importaciones que correspondan

switch (persistence) {
  case "memory":
    console.log("connected to memory");
    //voy a llenar dao con las importaciones de memory
    const { default: productsManagerMem } = await import(
      "./memory/ProductsManager.memory.js"
    );
    const { default: comprasManager } = await import(
      "./memory/ComprasManager.memory.js"
    );
    const { default: usersManagerMem } = await import(
      "./memory/UsersManager.memory.js"
    );
    const { default: ventasManager } = await import(
      "./memory/VentasManager.memory.js"
    );
    //se tienen que traer TODOS los manager de todos los recursos y ya tienen que estar HOMOLOGADOS
    //una vez que logré importar los managers, lleno el objeto dao con los recursos correspondientes
    dao = {
      users: usersManagerMem,
      products: productsManagerMem,
      compras: comprasManager,
      vemtas: ventasManager,
    };
    break;
  case "fs":
    console.log("connected to file system");
    //voy a llenar dao con las importaciones de fs
    const { default: productsManagerFs } = await import(
      "./fs/ProductsManager.fs.js"
    );
    const { default: cartsManagerFs } = await import("./fs/CartsManager.fs.js");
    const { default: usersManagerFs } = await import("./fs/UsersManager.fs.js");
    //se tienen que traer TODOS los manager de todos los recursos y ya tienen que estar HOMOLOGADOS
    //una vez que logré importar los managers, lleno el objeto dao con los recursos correspondientes
    dao = {
      users: usersManagerFs,
      products: productsManagerFs,
      carts: cartsManagerFs,
    };
    break;
  default:
    console.log("connected to database");
    dbConnect();
    //por defecto manejemos mongo
    //voy a llenar dao con las importaciones de mongo
    const { default: productsManagerMongo } = await import(
      "./mongo/ProductsManager.mongo.js"
    );
    const { default: comprasManagerMongo } = await import(
      "./mongo/ComprasManager.mongo.js"
    );
    const { default: usersManagerMongo } = await import(
      "./mongo/UsersManager.mongo.js"
    );
    const { default: ventasManagerMongo } = await import(
      "./mongo/VentasManager.mongo.js"
    );
    const { default: cajaManagerMongo } = await import(
      "./mongo/Caja.Manager.mongo.js"
    );
    const { default: cierreManagerMongo } = await import(
      "./mongo/Cierre.Manager.mongo.js"
    );
    //se tienen que traer TODOS los manager de todos los recursos y ya tienen que estar HOMOLOGADOS
    //una vez que logré importar los managers, lleno el objeto dao con los recursos correspondientes
    dao = {
      users: usersManagerMongo,
      products: productsManagerMongo,
      carts: comprasManagerMongo,
      ventas: ventasManagerMongo,
      caja: cajaManagerMongo,
      cierres: cierreManagerMongo,
    };
    break;
}

export default dao;
