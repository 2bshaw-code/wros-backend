const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");
const { sendSuccess, sendError } = require("../utils/response");

const router = express.Router();
const tenantId = "000000000000000000000001";
const customers = [
  { _id: "customer-test-1", name: "Ava Carter", email: "ava@example.test", phone: "447700900001", tags: ["vip"] },
  { _id: "customer-test-2", name: "Noah Smith", email: "noah@example.test", phone: "447700900002", tags: ["new"] },
];
const products = [
  { _id: "product-test-1", name: "Classic Brew", sku: "TEST-001", price: 12.5, stock: 42 },
  { _id: "product-test-2", name: "Trail Bottle", sku: "TEST-002", price: 24, stock: 18 },
];

const testOnly = (req, res, next) => {
  if (!config.WROS_TEST_MODE) return sendError(res, "Test mock API is disabled", 404);
  return next();
};

router.use(testOnly);

router.post("/test/mock/session", (req, res) => {
  const role = req.body?.operatorRole || "tenant_admin";
  const user = { id: "operator-test-1", email: req.body?.email || "operator@example.test", role: "manager", operatorRole: role, tenantId, businessId: tenantId, permissions: ["read", "write", "manage_tenant", "manage_catalog"] };
  const token = jwt.sign(user, config.JWT_SECRET, { expiresIn: "1h" });
  return sendSuccess(res, { token, user }, 200);
});

router.use(authMiddleware, requireTenant);
router.get("/test/mock/dashboard", (req, res) => sendSuccess(res, { tenantId: req.tenantId, counts: { orders: 24, customers: customers.length, products: products.length, messages: 342 }, revenue: 12480.5 }));
router.get("/test/mock/customers", (req, res) => sendSuccess(res, customers.map((customer) => ({ ...customer, tenantId: req.tenantId }))));
router.get("/test/mock/products", (req, res) => sendSuccess(res, products.map((product) => ({ ...product, tenantId: req.tenantId }))));
router.get("/test/mock/orders", (req, res) => sendSuccess(res, [{ _id: "order-test-1", tenantId: req.tenantId, orderNumber: "WROS-TEST-001", total: 36.5, status: "processing", customerId: customers[0]._id }]));
router.get("/test/mock/reports/summary", (req, res) => sendSuccess(res, { tenantId: req.tenantId, totalSales: 12480.5, totalOrders: 24, totalCustomers: customers.length, avgOrderValue: 520.02 }));
router.get("/test/mock/crm/segments", (req, res) => sendSuccess(res, [{ segment: "vip", count: 1 }, { segment: "new", count: 1 }]));
router.get("/test/mock/delivery", (req, res) => sendSuccess(res, { tenantId: req.tenantId, enabled: true, operators: 2, activeDeliveries: 3 }));
router.get("/test/mock/billing/plans", (req, res) => sendSuccess(res, [{ id: "starter", name: "Starter", currency: "gbp", monthlyPriceCents: 1900 }, { id: "growth", name: "Growth", currency: "gbp", monthlyPriceCents: 4900 }, { id: "pro", name: "Pro", currency: "gbp", monthlyPriceCents: 9900 }]));
router.get("/test/mock/whatsapp/conversations/:customerId", (req, res) => sendSuccess(res, { tenantId: req.tenantId, customerId: req.params.customerId, messages: [{ id: "message-test-1", direction: "incoming", text: "Hello WROS", status: "delivered", timestamp: new Date().toISOString() }] }));
router.post("/test/mock/ai/ask", (req, res) => sendSuccess(res, { tenantId: req.tenantId, operatorId: req.user.id, reply: `Test BOB response for: ${req.body?.prompt || "your request"}`, structured: { intent: "test", confidence: 1 } }));

module.exports = router;