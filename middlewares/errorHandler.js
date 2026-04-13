export default function errorHandler(err, _req, res, _next) {
  console.error(err);

  return res.status(400).json({
    ok: false,
    message: err.message || "Error interno del servidor",
  });
}