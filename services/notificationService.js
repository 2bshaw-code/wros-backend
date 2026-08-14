const Notification = require("../models/Notification");

const notifyOnce = async ({ tenantId, type, entityId, message }) => Notification.findOneAndUpdate(
  { tenantId, type, entityId: String(entityId) },
  { $setOnInsert: { tenantId, type, entityId: String(entityId), message } },
  { upsert: true, new: true, setDefaultsOnInsert: true },
);

const listNotifications = (tenantId) => Notification.find({ tenantId }).sort({ createdAt: -1 });
module.exports = { notifyOnce, listNotifications };
