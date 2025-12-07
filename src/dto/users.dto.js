import argsUtil from "../utils/args.util.js";
import crypto from "crypto";
import { createHash } from "../utils/hash.util.js";
const persistence = argsUtil.persistence;

class UsuarioDTO {
  constructor(data) {
    if (persistence !== "mongo") {
      this._id = crypto.randomBytes(12).toString("hex");
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }
    this.nombre = data.nombre;
    this.email = data.email;
    this.rol = data.rol || 0;
    this.password = createHash(data.password);
  }
}

export default UsuarioDTO;
