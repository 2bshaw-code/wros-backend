const express = require("express");
const controller = require("./controller");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireFoundItPermission } = require("./permissions");

const router = express.Router();
router.use("/foundit", authMiddleware);
router.get("/foundit/status", requireFoundItPermission("view"), controller.status);
router.get("/foundit/listings", requireFoundItPermission("view"), controller.listings);
router.get("/foundit/merchants", requireFoundItPermission("view"), controller.merchants);
router.get("/foundit/platforms", requireFoundItPermission("view"), controller.platforms);
router.get("/foundit/runs", requireFoundItPermission("view"), controller.runs);
router.post("/foundit/platforms/add", requireFoundItPermission("manage"), controller.addPlatform);
router.patch("/foundit/platforms/:id", requireFoundItPermission("manage"), controller.updatePlatform);
router.post("/foundit/scrape/run", requireFoundItPermission("manage"), controller.run);
router.post("/foundit/merchants", requireFoundItPermission("manage"), controller.createMerchant);
router.post("/foundit/merchants/:id/export", requireFoundItPermission("export"), controller.exportMerchant);
router.post("/foundit/listings", requireFoundItPermission("manage"), controller.createListing);
router.patch("/foundit/listings/:id", requireFoundItPermission("manage"), controller.updateListing);
router.post("/foundit/listings/:id/export", requireFoundItPermission("export"), controller.exportListing);
router.post("/foundit/migrate", requireFoundItPermission("manage"), controller.migrate);

module.exports = router;