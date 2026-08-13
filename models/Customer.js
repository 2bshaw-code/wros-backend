const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    whatsappId: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
    notes: [{
      body: { type: String, trim: true, maxlength: 2000 },
      operatorId: { type: String, trim: true },
      createdAt: { type: Date, default: Date.now },
    }],
    deliveryTimeline: [{
      status: { type: String, trim: true },
      occurredAt: { type: Date, default: Date.now },
      detail: { type: String, trim: true, maxlength: 500 },
    }],
    bobInsights: [{
      summary: { type: String, trim: true, maxlength: 2000 },
      createdAt: { type: Date, default: Date.now },
    }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order", default: [] }],
  },
  { timestamps: true }
);

customerSchema.index({ tenantId: 1, email: 1 }, { unique: true });
customerSchema.index({ tenantId: 1, phone: 1 }, { unique: true });

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
