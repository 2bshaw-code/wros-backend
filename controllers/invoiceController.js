const { sendSuccess, sendError } = require("../utils/response");
const { generateCustomerInvoice, sendInvoice, getInvoice, listCustomerInvoices } = require("../services/merchantInvoiceService");

const planFromRequest = (req) => {
  if (!req.user?.plan?.features) throw new Error("Merchant console plan is required");
  return req.user.plan;
};

const generate = async (req, res) => {
  try {
    const invoice = await generateCustomerInvoice({ businessId: req.tenantId, customerId: req.body?.customer_id, orderId: req.body?.order_id, period: req.body?.period }, planFromRequest(req));
    sendSuccess(res, invoice, 201);
  } catch (error) {
    sendError(res, error.message, 403);
  }
};

const send = async (req, res) => {
  try {
    sendSuccess(res, await sendInvoice(req.tenantId, req.body?.invoice_id, planFromRequest(req)));
  } catch (error) {
    sendError(res, error.message, 403);
  }
};

const get = async (req, res) => {
  try {
    const invoice = await getInvoice(req.tenantId, req.params.id);
    if (!invoice) return sendError(res, "Invoice not found", 404);
    sendSuccess(res, invoice);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const customer = async (req, res) => {
  try {
    const invoices = await listCustomerInvoices(req.tenantId, req.params.id);
    sendSuccess(res, invoices, 200, { total: invoices.length });
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

module.exports = { generate, send, get, customer };