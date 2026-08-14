const mongoose = require("mongoose");
const crypto = require("crypto");

const invoiceItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 },
}, { _id: false, strict: "throw" });

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, required: true, unique: true, default: () => `INV-${crypto.randomUUID()}` },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", default: null, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null, index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    type: { type: String, enum: ["subscription", "customer_invoice"], default: "subscription" },
    period: { type: String, required: true }, // e.g. "2026-08"
    currency: { type: String, enum: ["gbp"], default: "gbp" },
    subscriptionAmountCents: { type: Number, default: 0 },
    messageCount: { type: Number, default: 0 },
    messageAmountCents: { type: Number, default: 0 },
    totalCents: { type: Number, required: true },
    items: { type: [invoiceItemSchema], default: [] },
    subtotal: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["draft", "issued", "sent", "paid", "cancelled", "void"],
      default: "draft",
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
