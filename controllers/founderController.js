const mongoose = require("mongoose");
const config = require("../config");
const { quantumLog } = require("../services/quantumService");
const { sendSuccess, sendError } = require("../utils/response");

const actionLog = [];
const startedAt = Date.now();

const health = (req, res) => sendSuccess(res, {
  backend: { status: "UP", uptime: process.uptime(), latencyMs: 0, errorRate: 0 },
  frontend: { status: "BUILD_READY", version: "wros-dev-build", hash: "wros-dev-build" },
  mongodb: { status: mongoose.connection.readyState === 1 ? "connected" : "disconnected", database: mongoose.connection.name || config.MONGO_URI },
  whatsapp: { mode: config.WHATSAPP_ACCESS_TOKEN ? "configured" : "test", lastError: null },
  stripe: { mode: config.STRIPE_KEY.includes("test") ? "test" : "configured" },
  automation: { status: "ready", jobsQueued: 0, jobsFailed: 0 },
  cloudApi: { status: "configured", url: config.API_URL },
  warnings: config.WROS_TEST_MODE ? ["Test mode is enabled"] : [],
  timestamp: new Date().toISOString(),
});

const system = (req, res) => sendSuccess(res, {
  routeMap: ["/api/auth", "/api/products", "/api/orders", "/api/customers", "/api/mock", "/api/founder"],
  responseTimes: [],
  errors: [],
  frontendRoutes: ["/console", "/founder", "/founder/bob", "/founder/system", "/founder/config", "/founder/logs"],
  build: { output: "wros-frontend/dist", bundleSize: null },
  database: { collections: [], indexes: "managed by mongoose" },
  integrations: { whatsapp: "test-ready", stripe: "test-ready", email: "not configured" },
  automationJobs: [],
});

const logs = (req, res) => sendSuccess(res, { startedAt: new Date(startedAt).toISOString(), entries: actionLog.slice(-100), quantum: quantumLog.slice(-100), errors: [], slowRoutes: [], summaries: [] });

const action = (name) => (req, res) => {
  const entry = { action: name, operatorId: req.user.id, mode: config.WROS_TEST_MODE ? "test" : config.NODE_ENV, timestamp: new Date().toISOString(), status: "accepted" };
  actionLog.push(entry);
  return sendSuccess(res, entry, 202);
};

const configSummary = (req, res) => sendSuccess(res, {
  mode: config.WROS_TEST_MODE ? "TEST" : String(config.NODE_ENV).toUpperCase(),
  envFiles: [".env.test", ".env.production"],
  urls: { api: config.API_URL, console: config.CONSOLE_URL, hosting: config.HOSTING_URL },
  integrations: { stripeKey: config.STRIPE_KEY ? "configured" : "missing", whatsappToken: config.WHATSAPP_ACCESS_TOKEN ? "configured" : "missing" },
});

const bobAsk = (req, res) => {
  const prompt = req.body?.prompt || "";
  actionLog.push({ action: "bob-ask", operatorId: req.user.id, prompt, mode: config.WROS_TEST_MODE ? "test" : config.NODE_ENV, timestamp: new Date().toISOString(), status: "accepted" });
  return sendSuccess(res, {
  prompt,
  reply: `Founder engineering response for: ${prompt || "system status"}`,
  context: {
    health: { backend: "UP", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" },
    logs: actionLog.slice(-10),
    config: { mode: config.WROS_TEST_MODE ? "TEST" : config.NODE_ENV, apiUrl: config.API_URL },
    routes: ["/founder", "/founder/system", "/founder/logs", "/console"],
    recentDeploy: { version: "wros-dev-build", hash: "wros-dev-build" },
  },
  structured: { intent: "founder_engineering", confidence: 1, actions: ["inspect", "report"] },
  });
};

module.exports = { health, system, logs, configSummary, bobAsk, action, actionLog };