const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "shipped", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    deliveryAssignment: {
      operatorId: { type: String, default: "", trim: true },
      fleetId: { type: String, default: "", trim: true },
      assignedAt: { type: Date, default: null },
    },
    deliveryTimeline: [{
      status: { type: String, trim: true },
      detail: { type: String, trim: true, maxlength: 500 },
      occurredAt: { type: Date, default: Date.now },
    }],
    deliveryMode: { type: String, enum: ["rider", "pickup"], default: "rider" },
    deliveryZoneId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryZone", default: null },
    deliveryFeeCents: { type: Number, default: 0 },
    cashOnDelivery: { type: Boolean, default: false },
  },
  { timestamps: true }
);

orderSchema.index({ tenantId: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
