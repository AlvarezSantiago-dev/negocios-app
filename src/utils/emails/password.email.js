// templates/recoveryEmail.js
export default function recoveryEmailTemplate({ name, link }) {
  return `
    <h1>Hola ${name}</h1>
    <p>Hacé click en el siguiente enlace para recuperar tu contraseña:</p>
    <a href="${link}">Recuperar contraseña</a>
  `;
}
