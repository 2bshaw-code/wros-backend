const { sendError } = require("../utils/response");

const ownerMiddleware = (req, res, next) => {
  const role = req.user?.operatorRole || req.user?.role;
  if (role !== "owner" && role !== "admin") return sendError(res, "Owner access required", 403);
  return next();
};

module.exports = { ownerMiddleware };
