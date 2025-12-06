// sendEmail.js
import transport from "./transportemail.js";

async function sendEmail({ to, subject, html }) {
  try {
    await transport.verify();

    await transport.sendMail({
      from: `EducPlataform <${process.env.GOOGLE_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    throw error;
  }
}

export default sendEmail;
