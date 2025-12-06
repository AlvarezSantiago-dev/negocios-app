import Manager from "./Manager.mongo.js";
import cierre from "./models/cierre.model.js";

const cierreManager = new Manager(cierre);
export default cierreManager;
