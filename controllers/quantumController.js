const quantum = require("../services/quantumService");
const { sendSuccess, sendError } = require("../utils/response");

const handle = (runner) => (req, res) => {
  try { return sendSuccess(res, runner(req.body || {})); }
  catch (error) { return sendError(res, error.message, 400); }
};

module.exports = { forecast: handle(quantum.forecast), optimise: handle(quantum.optimise), anomaly: handle(quantum.anomaly), security: handle(quantum.security) };