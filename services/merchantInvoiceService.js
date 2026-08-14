const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Business = require("../models/Business");
const Product = require("../models/Product");
const { notifyOnce } = require("./notificationService");

const requireFeature = (plan, feature) => {
  if (!plan?.features?.[feature]) throw new Error(`This invoice feature requires a plan with ${feature}`);
};

const validateItems = async (tenantId, items) => {
  if (!Array.isArray(items) || items.length === 0) throw new Error("At least one invoice item is required");
  const normalized = [];
  for (const item of items) {
    if (!item?.productId || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || !Number.isFinite(Number(item.price)) || Number(item.price) < 0) throw new Error("Each invoice item requires productId, positive integer quantity, and valid price");
    const product = await Product.findOne({ _id: item.productId, tenantId });
    if (!product) throw new Error("Invoice product not found");
    const price = Number(item.price);
    normalized.push({ productId: product._id, quantity: Number(item.quantity), price, lineTotal: Number((price * Number(item.quantity)).toFixed(2)) });
  }
  return normalized;
};

const invoiceView = async (invoice) => {
  const [customer, merchant] = await Promise.all([
    invoice.customerId ? Customer.findById(invoice.customerId).select("name phone email address whatsappId") : null,
    Business.findById(invoice.businessId).select("businessName phone email settings"),
  ]);
  return { ...invoice.toObject(), merchantId: invoice.merchantId || invoice.businessId, customerDetails: customer || null, merchantDetails: merchant ? { storeName: merchant.businessName, storePhone: merchant.phone, storeEmail: merchant.email, storeAddress: merchant.settings?.address || "", storeLogo: merchant.settings?.logo || "" } : null };
};

const createItemizedInvoice = async ({ businessId, customerId, items, tax = 0, status = "draft" }, plan) => {
  requireFeature(plan, "invoices_basic");
  const customer = await Customer.findOne({ _id: customerId, tenantId: businessId });
  if (!customer) throw new Error("Customer not found");
  const merchant = await Business.findById(businessId);
  if (!merchant) throw new Error("Merchant not found");
  const normalizedItems = await validateItems(businessId, items);
  if (!Number.isFinite(Number(tax)) || Number(tax) < 0) throw new Error("Tax must be a valid non-negative number");
  const subtotal = Number(normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  const normalizedTax = Number(Number(tax).toFixed(2));
  const invoice = await Invoice.create({ businessId, merchantId: businessId, customerId, items: normalizedItems, subtotal, tax: normalizedTax, total: Number((subtotal + normalizedTax).toFixed(2)), totalCents: Math.round((subtotal + normalizedTax) * 100), period: new Date().toISOString().slice(0, 7), currency: "gbp", type: "customer_invoice", status });
  if (invoice.status !== "draft") await notifyOnce({ tenantId: businessId, type: "invoice_status", entityId: `${invoice._id}:${invoice.status}`, message: `Invoice ${invoice.invoiceId} is ${invoice.status}` });
  return invoiceView(invoice);
};

const editItemizedInvoice = async (businessId, invoiceId, payload, plan) => {
  requireFeature(plan, "invoices_basic");
  const invoice = await Invoice.findOne({ _id: invoiceId, businessId, type: "customer_invoice" });
  if (!invoice) throw new Error("Invoice not found");
  const nextCustomerId = payload.customerId || invoice.customerId;
  if (!(await Customer.findOne({ _id: nextCustomerId, tenantId: businessId }))) throw new Error("Customer not found");
  const nextItems = payload.items ? await validateItems(businessId, payload.items) : invoice.items;
  const nextTax = payload.tax === undefined ? invoice.tax : Number(payload.tax);
  if (!Number.isFinite(nextTax) || nextTax < 0) throw new Error("Tax must be a valid non-negative number");
  const subtotal = Number(nextItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  invoice.customerId = nextCustomerId; invoice.items = nextItems; invoice.subtotal = subtotal; invoice.tax = Number(nextTax.toFixed(2)); invoice.total = Number((subtotal + invoice.tax).toFixed(2)); invoice.totalCents = Math.round(invoice.total * 100); if (payload.status) invoice.status = payload.status; await invoice.save(); if (payload.status) await notifyOnce({ tenantId: businessId, type: "invoice_status", entityId: `${invoice._id}:${invoice.status}`, message: `Invoice ${invoice.invoiceId} is ${invoice.status}` }); return invoiceView(invoice);
};

const generateCustomerInvoice = async ({ businessId, customerId, orderId, period }, plan) => {
  requireFeature(plan, "invoices_basic");
  const order = orderId ? await Order.findOne({ _id: orderId, tenantId: businessId }) : null;
  const resolvedCustomerId = customerId || order?.customerId;
  if (!resolvedCustomerId) throw new Error("customer_id or order_id is required");
  const customer = await Customer.findOne({ _id: resolvedCustomerId, tenantId: businessId });
  if (!customer) throw new Error("Customer not found");

  return Invoice.create({
    businessId,
    customerId: resolvedCustomerId,
    orderId: order?._id || null,
    period: period || new Date().toISOString().slice(0, 7),
    currency: "gbp",
    subscriptionAmountCents: 0,
    messageCount: 0,
    messageAmountCents: 0,
    totalCents: Math.round((order?.total || 0) * 100),
    type: "customer_invoice",
    status: "issued",
  });
};

const sendInvoice = async (businessId, invoiceId, plan) => {
  requireFeature(plan, "invoices_send");
  const invoice = await Invoice.findOne({ _id: invoiceId, businessId });
  if (!invoice) throw new Error("Invoice not found");
  invoice.status = "sent";
  await invoice.save();
  return invoice;
};

const getInvoice = (businessId, invoiceId) => Invoice.findOne({ _id: invoiceId, businessId }).populate("customerId").populate("orderId");
const listCustomerInvoices = (businessId, customerId) => Invoice.find({ businessId, customerId }).sort({ createdAt: -1 });

module.exports = { generateCustomerInvoice, createItemizedInvoice, editItemizedInvoice, sendInvoice, getInvoice, listCustomerInvoices };