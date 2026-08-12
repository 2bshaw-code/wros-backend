const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    ownerName: { type: String, required: true, trim: true },
    businessName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    whatsappNumber: { type: String, default: "", trim: true },
    subscriptionPlan: { type: String, default: "starter" },
    stripeCustomerId: { type: String, default: "" },
    subscriptionStatus: { type: String, default: "trial" },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

const Business = mongoose.model("Business", businessSchema);

module.exports = Business;
