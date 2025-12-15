import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

class TicketService {
  generarTicketVenta(venta) {
    const dir = path.resolve("tickets");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const fileName = `venta_${venta._id}.pdf`;
    const filePath = path.join(dir, fileName);

    // 80mm ancho, altura grande para flujo libre
    const doc = new PDFDocument({
      size: [226, 1000],
      margin: 10,
    });

    doc.pipe(fs.createWriteStream(filePath));

    /* ===== HEADER ===== */
    doc.fontSize(13).text("NEGOCIO X", { align: "center" });
    doc.fontSize(8).text("Venta al público", { align: "center" });

    doc.moveDown(0.3);
    doc.fontSize(8).text("------------------------");

    const fecha = new Date(venta.fecha).toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
    });

    doc.text(`Fecha: ${fecha}`);
    doc.text(`Pago: ${venta.metodoPago}`);

    doc.moveDown(0.3);
    doc.text("------------------------");

    /* ===== ITEMS ===== */
    venta.items.forEach((i) => {
      const nombre = i.nombre || i.productoId?.nombre || "Producto";

      doc.moveDown(0.2);

      // Nombre del producto (wrap automático)
      doc.fontSize(9).text(nombre, {
        width: 200,
      });

      // Detalle alineado
      const y = doc.y;

      doc
        .fontSize(8)
        .text(
          `${i.cantidad} x $${i.precioVenta.toLocaleString("es-AR")}`,
          10,
          y,
          { width: 120 }
        );

      doc.text(`$${i.subtotal.toLocaleString("es-AR")}`, 140, y, {
        width: 70,
        align: "right",
      });

      doc.moveDown(0.2);
    });

    /* ===== TOTAL ===== */
    doc.moveDown(0.3);
    doc.fontSize(8).text("------------------------");

    doc
      .fontSize(11)
      .text(`TOTAL: $${venta.totalVenta.toLocaleString("es-AR")}`, {
        align: "right",
      });

    /* ===== FOOTER ===== */
    doc.moveDown(0.6);
    doc.fontSize(8).text("Gracias por su compra", { align: "center" });
    doc.text("Conserve este ticket", { align: "center" });

    doc.end();

    return `/tickets/${fileName}`;
  }
}

export default new TicketService();
