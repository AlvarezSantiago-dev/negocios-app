import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

class TicketService {
  generarTicketVenta(venta) {
    const dir = path.resolve("tickets");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const fileName = `venta_${venta._id}.pdf`;
    const filePath = path.join(dir, fileName);

    // Ancho de 80mm (con 1mm = 2.83px, es decir, 80mm = 226px)
    const doc = new PDFDocument({
      size: [226, 600],
      margin: 10,
    });

    doc.pipe(fs.createWriteStream(filePath));

    // Título en grande y centralizado
    doc.fontSize(14).text("NEGOCIO X", { align: "center" });
    doc
      .fontSize(10)
      .text("-------------------------------", { align: "center" });

    doc.moveDown(0.5);
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleString("es-AR")}`);
    doc.text(`Pago: ${venta.metodoPago}`);

    doc.moveDown(0.5);
    doc.text("-------------------------------");

    // Detalle de productos
    venta.items.forEach((i) => {
      doc.moveDown(0.3);
      const nombre = i.productoId?.nombre ?? "Producto";
      doc.text(`${nombre} x${i.cantidad}`, { align: "left" });

      doc.text(`$${i.precioVenta.toLocaleString("es-AR")}`, { align: "right" });

      doc.text(`$${i.subtotal.toLocaleString("es-AR")}`, { align: "right" });
    });

    doc.moveDown(0.5);
    doc.text("-------------------------------");

    // Total
    doc
      .fontSize(12)
      .text(`TOTAL: $${venta.totalVenta.toLocaleString("es-AR")}`, {
        align: "right",
      });

    doc.moveDown(0.5);
    doc.text("Gracias por su compra", { align: "center" });

    doc.end();

    return `/tickets/${fileName}`;
  }
}

export default new TicketService();
