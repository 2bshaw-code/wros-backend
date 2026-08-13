const { getSettings, updateSettings } = require("../services/settingsService");
const { logAudit } = require("../logger");
const { sendSuccess, sendError } = require("../utils/response");

const getSettingsHandler = async (req, res) => {
  try { return sendSuccess(res, await getSettings(req.tenantId)); }
  catch (error) { return sendError(res, error.message, 404); }
};

const updateSettingsHandler = async (req, res) => {
  try {
    const settings = await updateSettings(req.tenantId, req.body || {});
    logAudit(req.tenantId, "settings.updated", { operatorId: req.user?.id });
    return sendSuccess(res, settings);
  } catch (error) { return sendError(res, error.message, 400); }
};

module.exports = { getSettingsHandler, updateSettingsHandler };