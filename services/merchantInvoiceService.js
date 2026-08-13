const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const Customer = require("../models/Customer");

const requireFeature = (plan, feature) => {
  if (!plan?.features?.[feature]) throw new Error(`This invoice feature requires a plan with ${feature}`);
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

module.exports = { generateCustomerInvoice, sendInvoice, getInvoice, listCustomerInvoices };