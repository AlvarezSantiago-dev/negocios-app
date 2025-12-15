import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

class TicketService {
  generarTicketVenta(venta) {
    const dir = path.resolve("tickets");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const fileName = `venta_${venta._id}.pdf`;
    const filePath = path.join(dir, fileName);

    // 80mm ≈ 226pt, altura dinámica
    const doc = new PDFDocument({
      size: [226, 1000], // altura grande, se adapta automáticamente
      margins: { top: 10, left: 10, right: 10, bottom: 10 },
    });

    doc.pipe(fs.createWriteStream(filePath));

    // ---------------- HEADER ----------------
    doc.fontSize(13).text("NEGOCIO X", { align: "center" });
    doc.moveDown(0.2);
    doc.fontSize(9).text("Venta al público", { align: "center" });

    doc.moveDown(0.4);
    doc.moveTo(10, doc.y).lineTo(216, doc.y).stroke();

    const fecha = new Date(venta.fecha).toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour12: false,
    });

    doc.fontSize(8).text(`Fecha: ${fecha}`);
    doc.text(`Pago: ${venta.metodoPago}`);

    doc.moveDown(0.4);
    doc.moveTo(10, doc.y).lineTo(216, doc.y).stroke();

    // ---------------- ITEMS ----------------
    const startX = 10;
    const colNombre = startX;
    const colDetalle = 130;
    const colSubtotal = 180;

    venta.items.forEach((i) => {
      const nombre = i.nombre || i.productoId?.nombre || "Producto";

      doc
        .fontSize(9)
        .text(nombre, colNombre, doc.y, { width: colDetalle - colNombre });

      const detalle = `${i.cantidad} x $${i.precioVenta.toLocaleString(
        "es-AR"
      )}`;
      doc
        .fontSize(8)
        .text(detalle, colDetalle, doc.y, { width: colSubtotal - colDetalle });

      const subtotal = `$${i.subtotal.toLocaleString("es-AR")}`;
      doc
        .fontSize(8)
        .text(subtotal, colSubtotal, doc.y, {
          width: 226 - colSubtotal,
          align: "right",
        });

      doc.moveDown(0.4);
    });

    // ---------------- TOTAL ----------------
    doc.moveTo(10, doc.y).lineTo(216, doc.y).stroke();
    doc.moveDown(0.2);
    doc
      .fontSize(11)
      .text(
        `TOTAL: $${venta.totalVenta.toLocaleString("es-AR")}`,
        colSubtotal,
        doc.y,
        { width: 226 - colSubtotal, align: "right" }
      );

    // ---------------- FOOTER ----------------
    doc.moveDown(0.6);
    doc.fontSize(8).text("Gracias por su compra", { align: "center" });
    doc.moveDown(0.2);
    doc.text("Conserve este ticket", { align: "center" });

    doc.end();

    return `/tickets/${fileName}`;
  }
}

export default new TicketService();
