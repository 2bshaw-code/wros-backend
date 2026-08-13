const { sendError } = require("../utils/response");

const requireTenant = (req, res, next) => {
  const tenantId = req.user?.tenantId || req.user?.businessId;
  if (!tenantId) {
    return sendError(res, "Merchant tenant context is required", 403);
  }

  req.tenantId = String(tenantId);
  return next();
};

module.exports = { requireTenant };