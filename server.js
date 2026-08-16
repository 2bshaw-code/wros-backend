require("dotenv").config();

const path = require("path");

if (process.env.DOTENV_CONFIG_PATH) {
  require("dotenv").config({ path: path.resolve(process.cwd(), process.env.DOTENV_CONFIG_PATH) });
}

const PORT = process.env.PORT || 8080;
const express = require("express");

const cors = require("cors");
const morgan = require("morgan");
const config = require("./config");
const { assertStability } = require("./config/stability");
assertStability(config);
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
const categoryRoutes = require("./routes/categoryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const downloadRoutes = require("./routes/downloadRoutes");
const faultRoutes = require("./routes/faultRoutes");
const crmRoutes = require("./routes/crmRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const messagingRoutes = require("./routes/messagingRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const testMockRoutes = require("./routes/testMockRoutes");
const mockRouter = require("./routes/mockRoutes");
const founderRoutes = require("./routes/founderRoutes");
const quantumRoutes = require("./routes/quantumRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const internalRoleRoutes = require("./routes/internalRoleRoutes");
const foundItRoutes = require("./foundit/routes");
const { startFoundItScheduler, stopFoundItScheduler } = require("./foundit/scheduler");
const { close: closeFoundItDatabase } = require("./foundit/db");
const { seedFounderMaster } = require("./services/founderMasterService");
const { migrate: migrateAuth, close: closeAuthDatabase } = require("./auth/db");
const { receiveWhatsAppWebhook } = require("./controllers/webhookController");
const { sendError } = require("./utils/response");
const { errorHandler } = require("./utils/errorHandler");
const { DOC_INDEX, resolveDoc, buildPdfBuffer } = require("./utils/pdfDocs");

const app = express();
let server;

app.use(morgan("dev"));
app.options(/.*/, cors(config.cors));
app.use(cors(config.cors));
app.use(express.json({ limit: "1mb", verify: (req, res, buffer) => { req.rawBody = buffer; } }));

// Guaranteed dashboard route (works even if multiple runtimes exist)
app.get("/dashboard", (req, res) => res.redirect(302, "/console/dashboard"));

app.use("/dashboard", express.static(path.join(__dirname, "..", "dashboard")));
const consoleDist = path.join(__dirname, "..", "wros-frontend", "dist");
app.use("/console", express.static(consoleDist, { redirect: false }));
// Serve the SPA entry for every client-side console route; React Router handles the path.
app.use("/console", (req, res, next) => {
  if (req.method !== "GET") return next();
  return res.sendFile(path.join(consoleDist, "index.html"));
});
app.use("/founder", express.static(consoleDist, { redirect: false }));
app.use("/founder", (req, res, next) => {
  if (req.method !== "GET") return next();
  return res.sendFile(path.join(consoleDist, "index.html"));
});
app.get("/faults", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "faults", "index.html"));
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(["/api/status", "/api/health", "/api/whatsapp", "/api/business/register", "/api/business/init", "/api/auth/login", "/api/auth/signin", "/api/auth/register", "/api/ai", "/api/internal/assign-role", "/api/foundit"], rateLimiter);

const apiRouter = express.Router();

apiRouter.use("/", internalRoleRoutes);
apiRouter.use("/", foundItRoutes);
apiRouter.use("/", authRoutes);
apiRouter.use("/", businessRoutes);
apiRouter.use("/", billingRoutes);
apiRouter.use("/", aiRoutes);
apiRouter.use("/", whatsappRoutes);
apiRouter.use("/", messagingRoutes);
apiRouter.use("/", settingsRoutes);
apiRouter.use("/", testMockRoutes);
apiRouter.use("/", systemRoutes);
apiRouter.use("/", healthRoutes);
apiRouter.use("/", productRoutes);
if (config.ORDERS_ENABLED) apiRouter.use("/", orderRoutes);
apiRouter.use("/", customerRoutes);
apiRouter.use("/", reportRoutes);
apiRouter.use("/", categoryRoutes);
apiRouter.use("/", notificationRoutes);
if (config.DOWNLOADS_ENABLED) apiRouter.use("/", downloadRoutes);
if (config.FAULTS_ENABLED) apiRouter.use("/", faultRoutes);
if (config.CRM_ENABLED) apiRouter.use("/", crmRoutes);
if (config.INVOICES_ENABLED) apiRouter.use("/", invoiceRoutes);
if (config.DELIVERY_ENABLED) apiRouter.use("/", deliveryRoutes);
apiRouter.use("/", adminRoutes);
apiRouter.use("/", founderRoutes);
apiRouter.use("/", quantumRoutes);
apiRouter.use("/", ownerRoutes);

app.use("/api/mock", mockRouter);
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
  const publicWebsite = process.env.PUBLIC_WEBSITE_URL || "https://wros-frontend.onrender.com";
  try {
    return res.redirect(302, new URL(publicWebsite).origin);
  } catch {
    return res.redirect(302, "https://wros-frontend.onrender.com");
  }
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
    stopFoundItScheduler();
    await closeAuthDatabase();
    await closeFoundItDatabase();
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
  const safeStartup = String(process.env.WROS_SAFE_STARTUP ?? "true").toLowerCase() !== "false";

  try {
    await migrateAuth();
    await seedFounderMaster();

    try {
      await connectMongo();
    } catch (error) {
      console.error("MongoDB startup error:", error.message);
      if (!safeStartup) throw error;
      console.warn("WROS safe startup is active; HTTP routes remain available while MongoDB is offline.");
    }

    server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log("Active routes: /api/auth, /api/business, /api/founder, /api/foundit");
    });

    startFoundItScheduler().catch((error) => console.error("Found IT scheduler startup failed:", error.message));

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
