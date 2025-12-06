import Manager from "./Manager.mongo.js";
import caja from "./models/caja.model.js";

const cajaManager = new Manager(caja);
export default cajaManager;
