import { Command } from "commander";

const args = new Command(); //permite configurar los argumentos del script
// si es una letra se usa - un solo menos si es --es una palabra
args.option("-p <port>", "port", 8080); //3 parametros
args.option("--env <env>", "environment", "prod"); // importante cuando esta solo el - es con un espacio y cuando hay 2 es con un = me refiero a los guiones medios. en la configuracion del package json
args.option("--persistence <pers>", "persistence", "mongo");

args.parse(); // para terminar la configuracion  y cerrarla.

export default args.opts(); //solo exportamos las opciones
