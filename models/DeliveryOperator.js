const mongoose = require("mongoose");

const deliveryOperatorSchema = new mongoose.Schema(
  {
    merchantId: { type: String, required: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: ["rider", "fleet_rider", "delivery_manager", "delivery_admin"], default: "rider" },
    phoneVerified: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

deliveryOperatorSchema.index({ merchantId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model("DeliveryOperator", deliveryOperatorSchema);