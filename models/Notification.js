const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
  type: { type: String, enum: ["low_stock", "new_order", "invoice_status"], required: true },
  entityId: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ tenantId: 1, type: 1, entityId: 1 }, { unique: true });
module.exports = mongoose.model("Notification", notificationSchema);
