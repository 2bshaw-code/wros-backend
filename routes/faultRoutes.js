const crypto = require("crypto");
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { sendError } = require("../utils/response");
const { reportFault } = require("../controllers/faultController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");

const router = express.Router();
const uploadDirectory = path.join(__dirname, "..", "uploads");
const imageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

fs.mkdirSync(uploadDirectory, { recursive: true });

const screenshotUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => callback(null, imageMimeTypes.has(file.mimetype)),
});

const uploadScreenshot = (req, res, next) => screenshotUpload.single("screenshot")(req, res, (error) => {
  if (error) return sendError(res, error.code === "LIMIT_FILE_SIZE" ? "Screenshot must be 5 MB or smaller" : error.message, 400);
  if (req.body?.screenshot && !req.file) return sendError(res, "Only JPEG, PNG, and WebP screenshots are supported", 400);
  return next();
});

router.post("/faults/report", authMiddleware, requireTenant, uploadScreenshot, reportFault);

module.exports = router;