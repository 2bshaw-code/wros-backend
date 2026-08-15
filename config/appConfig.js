require("./env");

const runtimeEnv = process.env;

const isEnabled = (value, fallback = false) =>
  String(value ?? fallback).toLowerCase() === "true";

const normalizeOrigin = (value) => {
  if (!value) return null;
  try { return new URL(value).origin; } catch { return value; }
};

const allowedOrigins = [
  "https://wros-frontend.onrender.com",
  "https://wros-console.onrender.com",
  "https://console.wros.co.uk",
  "https://www.wros.co.uk",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "https://example.com",
  runtimeEnv.CONSOLE_URL,
  runtimeEnv.HOSTING_URL,
  runtimeEnv.FRONTEND_URL,
].map(normalizeOrigin).filter(Boolean);

const NODE_ENV = runtimeEnv.NODE_ENV || "development";
const PORT = Number(runtimeEnv.PORT || 3000);
const MONGO_URI = runtimeEnv.MONGO_URI_PROD || runtimeEnv.MONGO_URI || "";
const JWT_REFRESH_SECRET = runtimeEnv.JWT_REFRESH_SECRET || runtimeEnv.REFRESH_TOKEN_SECRET || "";
const STRIPE_KEY = runtimeEnv.STRIPE_SECRET_KEY || runtimeEnv.STRIPE_KEY || "";

module.exports = {
  APP_NAME: runtimeEnv.APP_NAME || "WROS backend",
  NODE_ENV,
  PORT,
  MONGO_URI,
  MONGO_URI_PROD: runtimeEnv.MONGO_URI_PROD || "",
  JWT_SECRET: runtimeEnv.JWT_SECRET || "",
  JWT_REFRESH_SECRET,
  REFRESH_TOKEN_SECRET: JWT_REFRESH_SECRET,
  HOSTING_URL: runtimeEnv.HOSTING_URL || "http://localhost:3000",
  CONSOLE_URL: runtimeEnv.CONSOLE_URL || "http://localhost:5173/console",
  FRONTEND_URL: runtimeEnv.FRONTEND_URL || "http://localhost:5173",
  API_URL: runtimeEnv.API_URL || `http://localhost:${PORT}/api`,
  ENABLE_STRIPE: isEnabled(runtimeEnv.ENABLE_STRIPE),
  ENABLE_WHATSAPP: isEnabled(runtimeEnv.ENABLE_WHATSAPP),
  STRIPE_SECRET_KEY: runtimeEnv.STRIPE_SECRET_KEY || "",
  STRIPE_KEY,
  STRIPE_WEBHOOK_SECRET: runtimeEnv.STRIPE_WEBHOOK_SECRET || "",
  WHATSAPP_VERIFY_TOKEN: runtimeEnv.WHATSAPP_VERIFY_TOKEN || "",
  WHATSAPP_ACCESS_TOKEN: runtimeEnv.WHATSAPP_ACCESS_TOKEN || "",
  WHATSAPP_PHONE_NUMBER_ID: runtimeEnv.WHATSAPP_PHONE_NUMBER_ID || "",
  WHATSAPP_BUSINESS_ID: runtimeEnv.WHATSAPP_BUSINESS_ID || "",
  WHATSAPP_APP_SECRET: runtimeEnv.WHATSAPP_APP_SECRET || "",
  CRM_ENABLED: isEnabled(runtimeEnv.CRM_ENABLED, true),
  ORDERS_ENABLED: isEnabled(runtimeEnv.ORDERS_ENABLED, true),
  INVOICES_ENABLED: isEnabled(runtimeEnv.INVOICES_ENABLED, true),
  DELIVERY_ENABLED: isEnabled(runtimeEnv.DELIVERY_ENABLED, true),
  LDM_ENABLED: isEnabled(runtimeEnv.LDM_ENABLED, true),
  WHATSAPP_RIDER_MODE: isEnabled(runtimeEnv.WHATSAPP_RIDER_MODE, true),
  FAULTS_ENABLED: isEnabled(runtimeEnv.FAULTS_ENABLED, true),
  DOWNLOADS_ENABLED: isEnabled(runtimeEnv.DOWNLOADS_ENABLED, true),
  WROS_TEST_MODE: isEnabled(runtimeEnv.WROS_TEST_MODE),
  name: runtimeEnv.APP_NAME || "WROS backend",
  env: NODE_ENV,
  port: PORT,
  serviceStatus: "online",
  apiVersion: "v1",
  version: "1.0.0",
  commitHash: "wros-dev-build",
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Refresh-Token", "X-WROS-Client", "X-WROS-Tenant"],
    exposedHeaders: ["x-refresh-token"],
    credentials: true,
  },
};
