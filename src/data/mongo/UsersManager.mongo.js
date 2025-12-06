import Manager from "./Manager.mongo.js";
import User from "./models/usuarios.model.js";

const usersManager = new Manager(User);
export default usersManager;
