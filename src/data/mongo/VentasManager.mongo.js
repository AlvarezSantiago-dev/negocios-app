import Manager from "./Manager.mongo.js";
import Ventas from "./models/ventas.model.js";

const ventasManager = new Manager(Ventas);
export default ventasManager;
