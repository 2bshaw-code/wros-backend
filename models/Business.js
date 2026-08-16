const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    ownerName: { type: String, required: true, trim: true },
    businessName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    whatsappNumber: { type: String, default: "", trim: true },
    channelIdentifiers: { type: Map, of: String, default: {} },
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    subscriptionPlan: { type: String, enum: ["starter", "growth", "pro"], default: "starter" },
    stripeCustomerId: { type: String, default: "" },
    subscriptionStatus: { type: String, default: "trial" },
    status: { type: String, default: "active" },
    licenseToken: { type: String, default: "" },
    messageCount: { type: Number, default: 0 },
    messageRateCents: { type: Number, default: 5 },
    workspaceConnected: { type: Boolean, default: false },
    workspace: { type: mongoose.Schema.Types.Mixed, default: {} },
    systemProfile: { type: mongoose.Schema.Types.Mixed, default: {} },
    whatsappConnection: { type: mongoose.Schema.Types.Mixed, default: {} },
    hostingUrl: { type: String, default: "" },
    consoleUrl: { type: String, default: "" },
    apiUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

const Business = mongoose.model("Business", businessSchema);

module.exports = Business;
