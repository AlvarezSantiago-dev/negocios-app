import Service from "./service.js";
//no se conecta con dao por que incorporamos repository
//import dao from "../data/dao.factory.js";
import usersRepository from "../repositories/users.rep.js";
//const { users } = dao;

const usersService = new Service(usersRepository);

export const {
  createService,
  readService,
  readOneService,
  paginateService,
  updateService,
  destroyService,
} = usersService;
