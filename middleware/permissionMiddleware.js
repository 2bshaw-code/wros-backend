const { hasPermission } = require("../../security/permissions");
const { sendError } = require("../utils/response");

const requirePermission = (permission) => (req, res, next) => {
  const role = req.user?.operatorRole || req.user?.role;
  if (!hasPermission(role, permission)) return sendError(res, "Permission denied", 403);
  return next();
};

module.exports = { requirePermission };