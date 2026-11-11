// errorHandler.js
// Central place where Mongoose errors are mapped to HTTP responses.

export function errorHandler(err, req, res, next) {
  // Schema validation failed (missing or invalid field).
  if (err.name === "ValidationError") {
    const fields = {};
    for (const key in err.errors) {
      fields[key] = err.errors[key].message;
    }
    return res.status(400).json({ error: "ValidationError", fields });
  }

  // A value could not be cast, usually a malformed ObjectId.
  if (err.name === "CastError") {
    return res.status(400).json({
      error: "CastError",
      message: "Invalid ID format",
      field: err.path,
    });
  }

  // Duplicate value on a unique index.
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "value";
    return res.status(409).json({
      error: "DuplicateKey",
      message: field + " already exists",
      field,
    });
  }

  // Unknown error: log details server-side, hide them from the client.
  console.error(err);
  res.status(500).json({ error: "InternalServerError" });
}
