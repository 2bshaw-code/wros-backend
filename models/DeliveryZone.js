const mongoose = require("mongoose");

const deliveryZoneSchema = new mongoose.Schema(
  {
    merchantId: { type: String, required: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    feeCents: { type: Number, min: 0, default: 0 },
    estimatedMinutes: { type: Number, min: 0, default: 0 },
    riderPreference: { type: String, trim: true, default: "" },
    feeMode: { type: String, enum: ["flat", "zone", "distance"], default: "zone" },
    cashOnDeliveryAllowed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

deliveryZoneSchema.index({ merchantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("DeliveryZone", deliveryZoneSchema);