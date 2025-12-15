import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

class TicketService {
  generarTicketVenta(venta) {
    const dir = path.resolve("tickets");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const fileName = `venta_${venta._id}.pdf`;
    const filePath = path.join(dir, fileName);

    const doc = new PDFDocument({
      autoFirstPage: false,
      margins: { top: 10, left: 10, right: 10, bottom: 10 },
    });

    doc.pipe(fs.createWriteStream(filePath));

    // Crear página inicial (80mm)
    doc.addPage({ size: [226, 600] });

    // ================= HEADER =================
    doc.fontSize(13).text("NEGOCIO X", { align: "center" });
    doc.moveDown(0.2);
    doc.fontSize(9).text("Venta al público", { align: "center" });

    doc.moveDown(0.4);
    this.linea(doc);

    const fecha = new Date(venta.fecha).toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour12: false,
    });

    doc.fontSize(8).text(`Fecha: ${fecha}`);
    doc.text(`Pago: ${venta.metodoPago}`);

    doc.moveDown(0.4);
    this.linea(doc);

    // ================= ITEMS =================
    const colNombre = 10;
    const colDetalle = 120;
    const colSubtotal = 170;

    venta.items.forEach((i) => {
      const nombre = i.nombre || i.productoId?.nombre || "Producto";

      doc.fontSize(9).text(nombre, colNombre, doc.y, {
        width: colDetalle - colNombre,
      });

      doc
        .fontSize(8)
        .text(
          `${i.cantidad} x $${i.precioVenta.toLocaleString("es-AR")}`,
          colDetalle,
          doc.y
        );

      doc
        .fontSize(8)
        .text(`$${i.subtotal.toLocaleString("es-AR")}`, colSubtotal, doc.y, {
          align: "right",
        });

      doc.moveDown(0.4);
    });

    // ================= TOTAL =================
    this.linea(doc);

    doc.moveDown(0.2);
    doc
      .fontSize(11)
      .text(
        `TOTAL: $${venta.totalVenta.toLocaleString("es-AR")}`,
        colSubtotal,
        doc.y,
        { align: "right" }
      );

    // ================= FOOTER =================
    doc.moveDown(0.8);
    doc.fontSize(8).text("Gracias por su compra", { align: "center" });
    doc.moveDown(0.2);
    doc.text("Conserve este ticket", { align: "center" });

    // 🔴 AJUSTE FINAL DE ALTURA (CLAVE)
    const finalY = doc.y + 20;
    doc._pages[0].mediaBox = [0, 0, 226, finalY];

    doc.end();

    return `/tickets/${fileName}`;
  }

  linea(doc) {
    doc.moveTo(10, doc.y).lineTo(216, doc.y).stroke();
  }
}

export default new TicketService();
