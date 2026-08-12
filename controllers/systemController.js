const { getStatus } = require("../services/statusService");
const { sendSuccess } = require("../utils/response");

const getStatusController = (req, res) => {
  sendSuccess(res, getStatus());
};

module.exports = { getStatusController };
