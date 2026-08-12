const { sendError } = require("./response");

const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  sendError(res, message, statusCode, {
    path: req.originalUrl,
    method: req.method,
  });
};

module.exports = { errorHandler };
