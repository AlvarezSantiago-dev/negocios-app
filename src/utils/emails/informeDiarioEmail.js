export default function informeDiarioEmail({
  fecha,
  ventas,
  totalVendido,
  gananciaTotal,
}) {
  const filas = ventas
    .map(
      (v) => `
      <tr>
        <td>${new Date(v.fecha).toLocaleTimeString("es-AR")}</td>
        <td>${v.items.length}</td>
        <td>$${v.totalVenta}</td>
        <td>$${v.gananciaTotal}</td>
      </tr>
    `
    )
    .join("");

  return `
    <h2 style="color:#63b0cd;">Informe diario – ${fecha}</h2>
    <p>Cantidad de ventas: <strong>${ventas.length}</strong></p>
    <p>Total vendido: <strong>$${totalVendido}</strong></p>
    <p>Ganancia del día: <strong>$${gananciaTotal}</strong></p>

    <h3>Detalle de ventas</h3>
    <table style="width:100%; border-collapse:collapse;">
      <tr style="border-bottom:1px solid #ccc;">
        <th>Hora</th>
        <th>Items</th>
        <th>Total</th>
        <th>Ganancia</th>
      </tr>
      ${filas}
    </table>
  `;
}
