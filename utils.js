//configuracion variable por seguridad para identificar una ruta absoluta... se puede buscar
// en inet esta variable preestablecida con modulos nativos
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;
