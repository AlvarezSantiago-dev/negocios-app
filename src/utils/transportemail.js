// email.transport.js
import { createTransport } from "nodemailer";
import environment from "./env.util.js";

const { GOOGLE_EMAIL, GOOGLE_PASSWORD } = environment;

const transport = createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: GOOGLE_EMAIL, pass: GOOGLE_PASSWORD },
});

export default transport;
