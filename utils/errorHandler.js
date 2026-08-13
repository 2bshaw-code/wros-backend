const { sendError } = require("./response");
const config = require("../config");

const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const isProduction = config.NODE_ENV === "production";
  const message = isProduction && statusCode >= 500 ? "Internal server error" : err.message || "Internal server error";

  sendError(res, message, statusCode, {
    path: req.originalUrl,
    method: req.method,
  });
};

module.exports = { errorHandler };
