const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    direction: {
      type: String,
      enum: ["incoming", "outgoing"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: "MessageTemplate", default: null },
    broadcastId: { type: String, default: "", index: true },
    scheduledAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["queued", "sent", "delivered", "failed"],
      default: "sent",
    },
    provider: { type: String, default: "whatsapp", index: true },
    providerMessageId: { type: String, default: "", index: true },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

messageSchema.index({ tenantId: 1, customerId: 1, timestamp: -1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
