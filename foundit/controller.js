const repository = require("./repository");
const { migrate } = require("./db");
const { runScrapers } = require("./scrapers/engine");
const { sendSuccess, sendError } = require("../utils/response");

const handle = (operation, status = 200) => async (req, res) => {
  try { return sendSuccess(res, await operation(req), status); }
  catch (error) { console.error("Found IT request failed:", error.message); return sendError(res, error.message, error.message.includes("not configured") ? 503 : 400); }
};

module.exports = {
  status: handle(async () => ({ company: "Found IT", database: process.env.FOUND_IT_DATABASE_URL ? "configured" : "not configured", scheduler: process.env.FOUND_IT_SCHEDULER_ENABLED === "true" ? "enabled" : "disabled" })),
  migrate: handle(async () => { await migrate(); return { migrated: true }; }),
  platforms: handle(() => repository.listPlatforms()),
  merchants: handle((req) => repository.listMerchants(req.query)),
  listings: handle((req) => repository.listListings(req.query)),
  runs: handle((req) => repository.listRuns(req.query)),
  addPlatform: handle((req) => repository.addPlatform(req.body), 201),
  updatePlatform: handle((req) => repository.updatePlatform(req.params.id, req.body)),
  run: handle((req) => runScrapers({ platformId: req.body?.platformId, initiatedBy: req.user?.id }), 202),
  createMerchant: handle((req) => repository.createManualMerchant(req.body), 201),
  createListing: handle((req) => repository.createManualListing(req.body), 201),
  updateListing: handle((req) => repository.updateListing(req.params.id, req.body)),
  exportListing: handle((req) => repository.exportListing(req.params.id)),
  exportMerchant: handle((req) => repository.exportMerchant(req.params.id)),
};