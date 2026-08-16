const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const {
  productRecognize,
  shelfScan,
  whatsappReply,
  orderCreate,
  translate,
  analyticsOverview,
  ask,
  upload: uploadImageHandler,
  tts,
} = require("../controllers/aiController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");
const { sendError } = require("../utils/response");

const router = express.Router();
const uploadDirectory = path.join(__dirname, "..", "uploads");
const imageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

fs.mkdirSync(uploadDirectory, { recursive: true });

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => callback(null, imageMimeTypes.has(file.mimetype)),
});

const uploadImage = (req, res, next) => imageUpload.single("image")(req, res, (error) => {
  if (error) return sendError(res, error.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller" : error.message, 400);
  if (!req.file) return sendError(res, "Only JPEG, PNG, and WebP images are supported", 400);
  return next();
});

router.post("/ai/ask", authMiddleware, (req, res, next) => {
  req.tenantId = req.user?.tenantId || req.user?.businessId || null;
  return next();
}, ask);
router.use(authMiddleware, requireTenant);
router.post("/ai/product/recognize", productRecognize);
router.post("/ai/shelf/scan", shelfScan);
router.post("/ai/whatsapp/reply", whatsappReply);
router.post("/ai/order/create", orderCreate);
router.post("/ai/translate", translate);
router.post("/ai/upload", uploadImage, uploadImageHandler);
router.post("/ai/tts", tts);
router.get("/ai/analytics/overview", analyticsOverview);

module.exports = router;
