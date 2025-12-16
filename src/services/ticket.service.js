import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

class TicketService {
  generarTicketVenta(venta) {
    const dir = path.resolve("tickets");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const fileName = `venta_${venta._id}.pdf`;
    const filePath = path.join(dir, fileName);

    const PAGE_WIDTH = 226;
    const MARGIN = 10;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

    const doc = new PDFDocument({
      size: [PAGE_WIDTH, 1000],
      margins: { top: MARGIN, left: MARGIN, right: MARGIN, bottom: MARGIN },
    });

    doc.pipe(fs.createWriteStream(filePath));

    /* ================= HEADER ================= */
    doc.fontSize(13).text("NEGOCIO X", MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      align: "center",
    });

    doc.moveDown(0.2);
    doc.fontSize(9).text("Venta al público", MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      align: "center",
    });

    this.linea(doc);

    const fecha = new Date(venta.fecha).toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour12: false,
    });

    doc.fontSize(8).text(`Fecha: ${fecha}`);
    doc.text(`Pago: ${venta.metodoPago}`);

    this.linea(doc);

    /* ================= ITEMS ================= */
    const colNombre = MARGIN;
    const colDetalle = 120;
    const colSubtotal = 170;

    venta.items.forEach((i) => {
      const producto = i.productoId || {};

      const nombre =
        producto.tipo === "peso"
          ? `${producto.nombre} (kg)`
          : producto.nombre || "Producto";

      const esPeso = producto.tipo === "peso";

      doc.fontSize(9).text(nombre, colNombre, doc.y, {
        width: colDetalle - colNombre,
      });

      const cantidadTxt = esPeso
        ? `${Number(i.cantidad).toFixed(3)} kg`
        : `${i.cantidad}`;

      doc
        .fontSize(8)
        .text(
          `${cantidadTxt} x $${i.precioVenta.toLocaleString("es-AR")}`,
          colDetalle,
          doc.y
        );

      doc
        .fontSize(8)
        .text(`$${i.subtotal.toLocaleString("es-AR")}`, colSubtotal, doc.y, {
          width: PAGE_WIDTH - colSubtotal - MARGIN,
          align: "right",
        });

      doc.moveDown(0.4);
    });

    /* ================= TOTAL ================= */
    this.linea(doc);

    doc
      .fontSize(11)
      .text(
        `TOTAL: $${venta.totalVenta.toLocaleString("es-AR")}`,
        colSubtotal,
        doc.y,
        {
          width: PAGE_WIDTH - colSubtotal - MARGIN,
          align: "right",
        }
      );

    /* ================= FOOTER ================= */
    doc.moveDown(0.8);

    doc.fontSize(8).text("Gracias por su compra", MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      align: "center",
    });

    doc.moveDown(0.2);

    doc.text("Conserve este ticket", MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      align: "center",
    });

    doc.end();

    return `/tickets/${fileName}`;
  }

  linea(doc) {
    doc.moveDown(0.4);
    doc.moveTo(10, doc.y).lineTo(216, doc.y).stroke();
    doc.moveDown(0.4);
  }
}

export default new TicketService();
