//ENRUTADOR PRINCIPAL DE LA API

import CustomRouter from "../CustomRouter.js";

/*
import { Router } from "express";
const apiRouter = Router();
apiRouter.use("/products", productsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/carts", cartsRouter);
apiRouter.use("/tickets", ticketsRouter);
apiRouter.use("/sessions", sessionsRouter);

export default apiRouter;
*/
import comprasRouter from "./compras.api.js";
import productsRouter from "./products.api.js";
import sessionsRouter from "./sessions.api.js";
import ventasRouter from "./ventas.api.js";
import cajaRouter from "./caja.api.js";
class ApiRouter extends CustomRouter {
  init() {
    this.use("/products", productsRouter);
    this.use("/compras", comprasRouter);
    this.use("/ventas", ventasRouter);
    this.use("/sessions", sessionsRouter);
    this.use("/caja", cajaRouter);
  }
}
const apiRouter = new ApiRouter();

export default apiRouter.getRouter();
