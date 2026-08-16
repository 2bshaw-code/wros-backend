const { sendError } = require("../utils/response");

const founderMiddleware = (req, res, next) => {
  if (!req.user?.founder && req.user?.role !== "founder" && req.user?.role !== "founder_admin" && req.user?.role !== "founder_master" && req.user?.operatorRole !== "founder" && req.user?.operatorRole !== "founder_admin" && req.user?.operatorRole !== "founder_master") return sendError(res, "Founder access required", 403);
  return next();
};

module.exports = { founderMiddleware };