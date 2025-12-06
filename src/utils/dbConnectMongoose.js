import { connect } from "mongoose"; //metodo connect para conectarme con js a mongo
//devuelve siempre una promesa.
import environment from "./env.util.js";
const dbConnect = async () => {
  try {
    //
    await connect(environment.MONGO_URI);
    //despues
  } catch (error) {
    console.log(error);
  }
};
export default dbConnect;
