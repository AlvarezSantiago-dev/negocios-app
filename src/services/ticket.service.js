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
      size: [226, 600],
      margin: 10,
    });

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(12).text("NEGOCIO X", { align: "center" });
    doc.fontSize(8).text("------------------------", { align: "center" });

    doc.moveDown(0.5);
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleString("es-AR")}`);
    doc.text(`Pago: ${venta.metodoPago}`);

    doc.moveDown(0.5);
    doc.text("------------------------");

    venta.items.forEach((i) => {
      doc.moveDown(0.3);

      const nombre = i.productoId?.nombre ?? "Producto";
      doc.text(nombre);

      doc.text(`${i.cantidad} x $${i.precioVenta.toLocaleString("es-AR")}`);

      doc.text(`$${i.subtotal.toLocaleString("es-AR")}`, { align: "right" });
    });

    doc.moveDown(0.5);
    doc.text("------------------------");

    doc
      .fontSize(10)
      .text(`TOTAL: $${venta.totalVenta.toLocaleString("es-AR")}`, {
        align: "right",
      });

    doc.moveDown();
    doc.fontSize(8).text("Gracias por su compra", { align: "center" });

    doc.end();

    return `/tickets/${fileName}`;
  }
}

export default new TicketService();
