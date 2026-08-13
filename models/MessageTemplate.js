const mongoose = require("mongoose");

const messageTemplateSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["order_confirmation", "delivery_update", "payment_reminder", "promotion", "general"],
      default: "general",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

messageTemplateSchema.index({ tenantId: 1, name: 1 }, { unique: true });

const MessageTemplate = mongoose.model("MessageTemplate", messageTemplateSchema);

module.exports = MessageTemplate;
