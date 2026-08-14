const { listNotifications } = require("../services/notificationService");
const { sendSuccess } = require("../utils/response");
const list = async (req, res) => sendSuccess(res, await listNotifications(req.tenantId));
module.exports = { list };
