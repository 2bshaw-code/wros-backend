const Business = require("../models/Business");

const getSettings = async (tenantId) => {
  const business = await Business.findById(tenantId).select("settings");
  if (!business) throw new Error("Tenant not found");
  return business.settings || {};
};

const updateSettings = async (tenantId, changes = {}) => {
  const business = await Business.findById(tenantId);
  if (!business) throw new Error("Tenant not found");
  business.settings = { ...(business.settings || {}), ...changes };
  await business.save();
  return business.settings;
};

module.exports = { getSettings, updateSettings };