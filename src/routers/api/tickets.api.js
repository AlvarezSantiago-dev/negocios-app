import { Router } from "express";
import cartsManager from "../../data/mongo/CartsManager.mongo.js";
import { Types } from "mongoose";
import CustomRouter from "../CustomRouter.js";

class TicketsRouter extends CustomRouter {
  init() {
    this.read("/miticket", ["USER", "ADMIN"], async (req, res, next) => {
      try {
        const { user_id } = req.user;
        const ticket = await cartsManager.aggregate([
          //primer stage stage= instrucciones
          {
            $match: {
              user_id: new Types.ObjectId(user_id),
            },
          },
          //segundo stage
          {
            $lookup: {
              foreignField: "_id", //busca el campo _id
              from: "products", //en la colection products
              localField: "product_id", //donde esta el dato
              as: "product_id", // lo tiene que seguir manteniendo
            },
          },
          //tercer stage.
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: [{ $arrayElemAt: ["$product_id", 0] }, "$$ROOT"],
              },
            },
          },
          //cuarto stage
          {
            $set: { subTotal: { $multiply: ["$quantity", "$price"] } },
          },
          //quinto stage
          {
            $group: { _id: "$user_id", total: { $sum: "$subTotal" } },
          },
          //sexto stage
          {
            $project: {
              _id: 0,
              user_id: "$_id",
              total: "$total",
              date: new Date(),
            },
          },
          //septimo stage
          {
            $merge: { into: "tickets" },
          },
        ]);
        return res.exito200(ticket);
      } catch (error) {
        return next(error);
      }
    });
  }
}
const ticketsRouter = new TicketsRouter();
export default ticketsRouter.getRouter();
