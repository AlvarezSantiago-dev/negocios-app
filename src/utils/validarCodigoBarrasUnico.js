// src/utils/validarCodigoBarrasUnico.js
export default async function validarCodigoBarrasUnico(
  repository,
  codigoBarras,
  productoId = null
) {
  if (!codigoBarras) return;

  const filter = { codigoBarras };

  if (productoId) {
    filter._id = { $ne: productoId };
  }

  const encontrados = await repository.readRepository(filter);

  if (Array.isArray(encontrados) && encontrados.length > 0) {
    const err = new Error("CODIGO_BARRAS_DUPLICADO");
    err.statusCode = 409;
    throw err;
  }
}
