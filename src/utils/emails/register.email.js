// templates/registerEmail.js
export default function registerEmailTemplate({ name, code }) {
  return `
    <h1>¡Bienvenido a EducPlataform, ${name}!</h1>
    <p>Gracias por registrarte en nuestra plataforma educativa.</p>
    <p><strong>Código de verificación:</strong> ${code}</p>
  `;
}
