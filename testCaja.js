import dbConnect from "./src/utils/dbConnectMongoose.js"; // tu conexión DB
import cajaService from "./src/services/caja.service.js";
import cierreRepository from "./src/repositories/cierre.rep.js";
import Caja from "./src/data/mongo/models/caja.model.js";
import Cierre from "./src/data/mongo/models/cierre.model.js";
import ventasService from "./src/services/ventas.service.js"; // mock si existe

await dbConnect();
console.log("🔥 Conectado a MongoDB");

// Limpiamos colecciones para test
await Caja.deleteMany({});
await Cierre.deleteMany({});
console.log("🧹 Colecciones limpias para test");

// Fecha local AR para test
const ahoraAR = new Date(
  new Date().toLocaleString("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
  })
);
const fechaISO = `${ahoraAR.getFullYear()}-${String(
  ahoraAR.getMonth() + 1
).padStart(2, "0")}-${String(ahoraAR.getDate()).padStart(2, "0")}`;

// Fecha UTC ajustada al inicio del día para los movimientos
const fechaUTC = new Date(`${fechaISO}T12:00:00.000Z`); // mediodía UTC, seguro cae dentro del rango

// Creamos movimientos de prueba
await cajaService.crearMovimientoService({
  tipo: "ingreso",
  motivo: "Venta 1",
  monto: 3000,
  metodo: "efectivo",
  operacion: "movimiento",
  fecha: fechaUTC,
});
await cajaService.crearMovimientoService({
  tipo: "ingreso",
  motivo: "Venta 2",
  monto: 3000,
  metodo: "mp",
  operacion: "movimiento",
  fecha: fechaUTC,
});
await cajaService.crearMovimientoService({
  tipo: "ingreso",
  motivo: "Venta 3",
  monto: 3000,
  metodo: "transferencia",
  operacion: "movimiento",
  fecha: fechaUTC,
});

// Crear apertura (si no hay)
await cajaService.crearMovimientoService({
  tipo: "ingreso",
  motivo: "Apertura caja",
  monto: 1000,
  metodo: "efectivo",
  operacion: "apertura",
  fecha: fechaUTC,
});

// Mock usuario
const reqMock = { user: { email: "admin@test.com" } };

// Cierre de caja
const cierreCaja = async () => {
  const yaCerro = await cierreRepository.existeCierreHoy(fechaISO);
  if (yaCerro) return console.log("❌ La caja ya fue cerrada hoy.");

  const resumen = await cajaService.resumenDelDiaService(fechaISO);

  const cierreData = {
    operacion: "cierre",
    fecha: fechaISO,
    efectivo: resumen.efectivo,
    mp: resumen.mp,
    transferencia: resumen.transferencia,
    total: resumen.total,
    apertura:
      resumen.movimientos.find((m) => m.operacion === "apertura")?.monto ?? 0,
    ingresos: resumen.ingresos,
    egresos: resumen.egresos,
    cantidadVentas: (await ventasService.ventasDiariasService(fechaISO)).length,
    usuario: reqMock.user.email,
    cierreHora: ahoraAR,
  };

  const cierre = await cierreRepository.crearCierre(cierreData);
  console.log("✅ Cierre generado correctamente:\n", cierre);

  console.log("\n📊 Totales calculados del día:");
  console.log("Efectivo:", resumen.efectivo);
  console.log("MP:", resumen.mp);
  console.log("Transferencia:", resumen.transferencia);
  console.log("Total:", resumen.total);
};

await cierreCaja();

// Cerrar conexión
await (await import("mongoose")).connection.close();
console.log("👋 Conexión cerrada");
