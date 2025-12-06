import Manager from "./Manager.mongo.js";
import Compras from "./models/compras.model.js";

const comprasManager = new Manager(Compras);
export default comprasManager;
