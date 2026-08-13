const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null, index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    type: { type: String, enum: ["subscription", "customer_invoice"], default: "subscription" },
    period: { type: String, required: true }, // e.g. "2026-08"
    currency: { type: String, enum: ["gbp"], default: "gbp" },
    subscriptionAmountCents: { type: Number, default: 0 },
    messageCount: { type: Number, default: 0 },
    messageAmountCents: { type: Number, default: 0 },
    totalCents: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "issued", "sent", "paid", "void"],
      default: "draft",
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
