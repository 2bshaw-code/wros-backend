const env = require("./env");

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  env.HOSTING_URL,
  env.CONSOLE_URL,
  env.FRONTEND_URL,
].filter(Boolean).map((value) => {
  try { return new URL(value).origin; } catch { return value; }
});

module.exports = {
  name: env.APP_NAME,
  env: env.NODE_ENV,
  port: env.PORT,
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
