const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config");
const { connectMongo } = require("./config/mongo");
const { rateLimiter } = require("./middleware/rateLimiter");
const authRoutes = require("./routes/authRoutes");
const businessRoutes = require("./routes/businessRoutes");
const billingRoutes = require("./routes/billingRoutes");
const aiRoutes = require("./routes/aiRoutes");
const adminRoutes = require("./routes/adminRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");
const systemRoutes = require("./routes/systemRoutes");
const dataRoutes = require("./routes/dataRoutes");
const healthRoutes = require("./routes/healthRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const customerRoutes = require("./routes/customerRoutes");
const { sendError } = require("./utils/response");
const { errorHandler } = require("./utils/errorHandler");

const app = express();
let server;

app.use(morgan("dev"));
app.use(cors(config.cors));
app.use(express.json({ limit: "1mb" }));

app.use(["/status", "/health", "/whatsapp/incoming", "/business/register"], rateLimiter);

app.use("/", authRoutes);
app.use("/", businessRoutes);
app.use("/", billingRoutes);
app.use("/", aiRoutes);
app.use("/", adminRoutes);
app.use("/", whatsappRoutes);
app.use("/", systemRoutes);
app.use("/", dataRoutes);
app.use("/", healthRoutes);
app.use("/", productRoutes);
app.use("/", orderRoutes);
app.use("/", customerRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      message: "WROS backend running",
      timestamp: new Date().toISOString(),
    },
  });
});

app.get("/version", (req, res) => {
  res.json({
    success: true,
    data: {
      version: config.version,
      commitHash: config.commitHash,
      environment: config.env,
    },
  });
});

app.get("/ready", async (req, res) => {
  const mongoose = require("mongoose");
  const dbState = mongoose && mongoose.connection ? mongoose.connection.readyState : 0;
  res.json({
    success: true,
    data: {
      ready: dbState === 1,
      database: dbState === 1 ? "connected" : "disconnected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.use((req, res) => {
  sendError(res, "Route not found", 404, {
    path: req.originalUrl,
    method: req.method,
  });
});

app.use(errorHandler);

const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  } catch (error) {
    console.error("MongoDB close error:", error.message);
  }

  process.exit(0);
};

const startServer = async () => {
  try {
    await connectMongo();

    server = app.listen(config.port, () => {
      console.log(`Server running at http://localhost:${config.port}`);
      console.log("Active routes:");
      console.log("- POST /auth/register");
      console.log("- POST /auth/login");
      console.log("- POST /business/register");
      console.log("- POST /business/whatsapp/connect");
      console.log("- GET /business/settings");
      console.log("- PUT /business/settings");
      console.log("- POST /billing/create-customer");
      console.log("- POST /billing/create-subscription");
      console.log("- POST /billing/webhook");
      console.log("- POST /ai/product/recognize");
      console.log("- POST /ai/shelf/scan");
      console.log("- POST /ai/whatsapp/reply");
      console.log("- POST /ai/order/create");
      console.log("- POST /ai/translate");
      console.log("- GET /ai/analytics/overview");
      console.log("- GET /status");
      console.log("- GET /health");
      console.log("- GET /version");
      console.log("- GET /ready");
      console.log("- GET /products");
      console.log("- POST /products");
      console.log("- PUT /products/:id");
      console.log("- DELETE /products/:id");
      console.log("- GET /orders");
      console.log("- POST /orders");
      console.log("- PUT /orders/:id");
      console.log("- GET /customers");
      console.log("- POST /customers");
      console.log("- GET /customers/phone/:phone");
      console.log("- GET /admin/overview");
      console.log("- GET /admin/products");
      console.log("- GET /admin/orders");
      console.log("- GET /admin/customers");
      console.log("- POST /whatsapp/incoming");
      console.log("- GET /whatsapp/messages/:customerId");
    });

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
