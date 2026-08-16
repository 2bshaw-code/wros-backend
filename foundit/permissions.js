const { sendError } = require("../utils/response");

const permissions = {
  founder_master: new Set(["view", "export", "manage"]),
  founder: new Set(["view", "export", "manage"]),
  founder_admin: new Set(["view", "export", "manage"]),
  admin: new Set(["view", "export", "manage"]),
  owner: new Set(["view", "export"]),
};

const requireFoundItPermission = (permission) => (req, res, next) => {
  const role = req.user?.operatorRole || req.user?.role;
  if (!permissions[role]?.has(permission)) return sendError(res, "Found IT permission denied", 403);
  return next();
};

module.exports = { permissions, requireFoundItPermission };