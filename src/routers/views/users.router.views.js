import { Router } from "express";
import usersManager from "../../data/mongo/UsersManager.mongo.js";
import passportCb from "../../middleware/passportCb.mid.js";
const usersViewRoter = Router();
usersViewRoter.get("/", async (req, res, next) => {
  try {
    const users = await usersManager.read();
    return res.render("users", { users });
  } catch (error) {
    next(error);
  }
});

usersViewRoter.get("/profile", passportCb("jwt"), async (req, res, next) => {
  try {
    const { email } = req.user;

    const user = await usersManager.readByEmail(email);

    return res.render("profile", { user });
  } catch (error) {
    return next(error);
  }
});
export default usersViewRoter;
