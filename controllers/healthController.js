const { getHealth } = require("../services/healthService");
const { sendSuccess } = require("../utils/response");

const getHealthController = (req, res) => {
  sendSuccess(res, getHealth());
};

module.exports = { getHealthController };
