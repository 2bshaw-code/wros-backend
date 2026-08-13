const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/response");
const config = require("../config");

const JWT_SECRET = config.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Access token required", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const requestedTenant = req.headers["x-wros-tenant"];
    if (requestedTenant && decoded.tenantId && String(requestedTenant) !== String(decoded.tenantId)) {
      return sendError(res, "Tenant context does not match the authenticated session", 403);
    }
    req.user = decoded;
    return next();
  } catch (error) {
    return sendError(res, "Invalid or expired token", 401, error.message);
  }
};

module.exports = { authMiddleware };
