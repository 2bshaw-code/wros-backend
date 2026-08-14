const express = require("express");

const mockRouter = express.Router();

const mockOrders = [
  {
    id: "mock-order-001",
    orderNumber: "WROS-MOCK-001",
    customerId: "mock-customer-001",
    total: 36.5,
    currency: "gbp",
    status: "processing",
    createdAt: "2026-08-14T09:00:00.000Z",
  },
];

const mockProducts = [
  { id: "mock-product-001", name: "Classic Brew", sku: "MOCK-001", price: 12.5, stock: 42 },
  { id: "mock-product-002", name: "Trail Bottle", sku: "MOCK-002", price: 24, stock: 18 },
];

const mockCustomers = [
  { id: "mock-customer-001", name: "Ava Carter", email: "ava@example.test", phone: "447700900001", tags: ["vip"] },
  { id: "mock-customer-002", name: "Noah Smith", email: "noah@example.test", phone: "447700900002", tags: ["new"] },
];

const mockMessages = [
  {
    id: "mock-message-001",
    customerId: "mock-customer-001",
    direction: "incoming",
    text: "Hello WROS",
    status: "delivered",
    timestamp: "2026-08-14T09:05:00.000Z",
  },
];

mockRouter.get("/orders", (req, res) => res.json({ success: true, data: mockOrders }));
mockRouter.get("/products", (req, res) => res.json({ success: true, data: mockProducts }));
mockRouter.get("/customers", (req, res) => res.json({ success: true, data: mockCustomers }));
mockRouter.get("/messages", (req, res) => res.json({ success: true, data: mockMessages }));
mockRouter.get("/settings", (req, res) => res.json({
  success: true,
  data: {
    theme: "light",
    locale: "en-GB",
    currency: "GBP",
    notifications: { email: true, whatsapp: true },
  },
}));

mockRouter.get("/legal/privacy", (req, res) => res.json({
  success: true,
  data: { title: "Privacy Policy", content: "WROS uses tenant-scoped data to provide retail operations and messaging services." },
}));

mockRouter.get("/legal/terms", (req, res) => res.json({
  success: true,
  data: { title: "Terms of Service", content: "WROS services are provided for authorized merchant operations." },
}));

mockRouter.get("/legal/cookies", (req, res) => res.json({
  success: true,
  data: { title: "Cookie Policy", content: "The WROS console uses session and preference storage to operate the application." },
}));

mockRouter.get("/docs/api", (req, res) => res.json({
  success: true,
  data: { title: "WROS API Documentation", version: "mock-v1", baseUrl: "/api", authentication: "Bearer JWT" },
}));

mockRouter.get("/docs/system", (req, res) => res.json({
  success: true,
  data: { title: "WROS System Documentation", status: "test-ready", modules: ["console", "crm", "orders", "messaging", "ai"] },
}));

module.exports = mockRouter;