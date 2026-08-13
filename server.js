const express = require("express");
const path = require("path");
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
const healthRoutes = require("./routes/healthRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const customerRoutes = require("./routes/customerRoutes");
const reportRoutes = require("./routes/reportRoutes");
const downloadRoutes = require("./routes/downloadRoutes");
const faultRoutes = require("./routes/faultRoutes");
const crmRoutes = require("./routes/crmRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const messagingRoutes = require("./routes/messagingRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const { receiveWhatsAppWebhook } = require("./controllers/webhookController");
const { sendError } = require("./utils/response");
const { errorHandler } = require("./utils/errorHandler");
const { DOC_INDEX, resolveDoc, buildPdfBuffer } = require("./utils/pdfDocs");

const app = express();
let server;

app.use(morgan("dev"));
app.use(cors(config.cors));
app.use(express.json({ limit: "1mb", verify: (req, res, buffer) => { req.rawBody = buffer; } }));

// Guaranteed dashboard route (works even if multiple runtimes exist)
app.get("/dashboard", (req, res) => res.redirect(302, "/console/dashboard"));

app.use("/dashboard", express.static(path.join(__dirname, "..", "dashboard")));
const consoleDist = path.join(__dirname, "..", "wros-frontend", "dist");
app.use("/console", express.static(consoleDist));
app.use("/console", (req, res, next) => {
  if (req.method !== "GET") return next();
  return res.sendFile(path.join(consoleDist, "index.html"));
});
app.get("/faults", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "faults", "index.html"));
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(["/api/status", "/api/health", "/api/whatsapp", "/api/business/register", "/api/auth/login", "/api/auth/register", "/api/ai"], rateLimiter);

const apiRouter = express.Router();

apiRouter.use("/", authRoutes);
apiRouter.use("/", businessRoutes);
apiRouter.use("/", billingRoutes);
apiRouter.use("/", aiRoutes);
apiRouter.use("/", adminRoutes);
apiRouter.use("/", whatsappRoutes);
apiRouter.use("/", messagingRoutes);
apiRouter.use("/", settingsRoutes);
apiRouter.use("/", systemRoutes);
apiRouter.use("/", healthRoutes);
apiRouter.use("/", productRoutes);
if (config.ORDERS_ENABLED) apiRouter.use("/", orderRoutes);
apiRouter.use("/", customerRoutes);
apiRouter.use("/", reportRoutes);
if (config.DOWNLOADS_ENABLED) apiRouter.use("/", downloadRoutes);
if (config.FAULTS_ENABLED) apiRouter.use("/", faultRoutes);
if (config.CRM_ENABLED) apiRouter.use("/", crmRoutes);
if (config.INVOICES_ENABLED) apiRouter.use("/", invoiceRoutes);
if (config.DELIVERY_ENABLED) apiRouter.use("/", deliveryRoutes);

app.use("/api", apiRouter);

app.get('/api/docs', (req, res) => {
  res.json({ success: true, data: DOC_INDEX });
});

app.get('/api/docs/:name/pdf', (req, res) => {
  const doc = resolveDoc(req.params.name);

  if (!doc) {
    return sendError(res, 'Document not found', 404, { requested: req.params.name });
  }

  const pdfBuffer = buildPdfBuffer(doc);
  const filename = `${doc.filename || doc.name || 'wros-doc'}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
  res.setHeader('Cache-Control', 'no-store');
  return res.send(pdfBuffer);
});

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

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.WHATSAPP_VERIFY_TOKEN) {
    console.log("Meta webhook verified successfully.");
    return res.status(200).send(challenge);
  }

  return res.status(403).send("Forbidden");
});

app.post("/webhook", receiveWhatsAppWebhook);

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
      console.log("Active routes (all prefixed with /api):");
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
      console.log("- GET /products/:id");
      console.log("- POST /products");
      console.log("- PUT /products/:id");
      console.log("- DELETE /products/:id");
      console.log("- GET /orders");
      console.log("- GET /orders/:id");
      console.log("- POST /orders");
      console.log("- PUT /orders/:id");
      console.log("- PATCH /orders/:id/status");
      console.log("- GET /customers");
      console.log("- POST /customers");
      console.log("- PUT /customers/:id");
      console.log("- GET /customers/:id");
      console.log("- GET /customers/:id/orders");
      console.log("- GET /customers/phone/:phone");
      console.log("- GET /admin/overview");
      console.log("- GET /admin/products");
      console.log("- GET /admin/orders");
      console.log("- GET /admin/customers");
      console.log("- POST /whatsapp/incoming");
      console.log("- GET /whatsapp/messages/:customerId");
      console.log("- GET /reports/sales, /reports/top-products, /reports/customer-segments, /reports/inventory, /reports/summary");
    });

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
