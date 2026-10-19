export function notFoundHandler(req, res) {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.path}` });
}

export function errorHandler(error, _req, res, _next) {
  if (error?.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ message: "Request body must contain valid JSON." });
  }
  if (error?.name === "MulterError") {
    const tooLarge = error.code === "LIMIT_FILE_SIZE";
    return res.status(tooLarge ? 413 : 400).json({
      message: tooLarge
        ? "Product images must be 5 MB or smaller."
        : "Upload one product image at a time.",
    });
  }
  if (error?.code === 11000) {
    return res
      .status(409)
      .json({ message: "A record with this value already exists." });
  }
  if (error?.name === "ValidationError") {
    return res.status(400).json({
      message: "The submitted data is invalid.",
      details: Object.values(error.errors).map((item) => item.message),
    });
  }
  if (error?.status) {
    return res.status(error.status).json({
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }
  console.error(error);
  return res
    .status(500)
    .json({ message: "An unexpected server error occurred." });
}
