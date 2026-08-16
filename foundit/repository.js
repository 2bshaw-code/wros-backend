const { query } = require("./db");
const { fingerprintListing, normalizeText, normalizeUrl } = require("./utils");

const listPlatforms = async ({ includeSecrets = false } = {}) => (await query(`SELECT id, name, base_url, scrape_method, ${includeSecrets ? "api_key," : ""} active, config, created_at, updated_at FROM "FOUND_IT".platforms ORDER BY name`)).rows;
const listMerchants = async ({ limit = 100, offset = 0 } = {}) => (await query('SELECT * FROM "FOUND_IT".merchants ORDER BY last_seen DESC LIMIT $1 OFFSET $2', [Math.min(Number(limit) || 100, 500), Number(offset) || 0])).rows;
const listListings = async ({ limit = 100, offset = 0, status } = {}) => {
  const params = [Math.min(Number(limit) || 100, 500), Number(offset) || 0];
  const where = status ? "WHERE l.status = $3" : "";
  if (status) params.push(status);
  return (await query(`SELECT l.*, m.name AS merchant_name, m.platform FROM "FOUND_IT".listings l JOIN "FOUND_IT".merchants m ON m.id = l.merchant_id ${where} ORDER BY l.scraped_at DESC LIMIT $1 OFFSET $2`, params)).rows;
};
const listRuns = async ({ limit = 100 } = {}) => (await query('SELECT r.*, p.name AS platform_name FROM "FOUND_IT".scrape_runs r LEFT JOIN "FOUND_IT".platforms p ON p.id = r.platform_id ORDER BY r.started_at DESC LIMIT $1', [Math.min(Number(limit) || 100, 500)])).rows;

const addPlatform = async (payload) => {
  const name = normalizeText(payload.name);
  const baseUrl = normalizeUrl(payload.baseUrl);
  const method = normalizeText(payload.scrapeMethod);
  if (!name || !baseUrl || !["rss", "html", "playwright", "ebay_api"].includes(method)) throw new Error("name, baseUrl, and a valid scrapeMethod are required");
  return (await query('INSERT INTO "FOUND_IT".platforms (name, base_url, scrape_method, api_key, active, config) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, base_url, scrape_method, active, config', [name, baseUrl, method, payload.apiKey || null, payload.active !== false, payload.config || {}])).rows[0];
};

const updatePlatform = async (id, payload) => (await query('UPDATE "FOUND_IT".platforms SET active = COALESCE($2, active), config = COALESCE($3, config), updated_at = NOW() WHERE id = $1 RETURNING id, name, base_url, scrape_method, active, config', [id, payload.active ?? null, payload.config ?? null])).rows[0];

const upsertMerchant = async (platform, item) => (await query('INSERT INTO "FOUND_IT".merchants (name, platform, url, contact_info, location, last_seen) VALUES ($1,$2,$3,$4,$5,NOW()) ON CONFLICT (platform, url) DO UPDATE SET name = EXCLUDED.name, contact_info = EXCLUDED.contact_info, location = EXCLUDED.location, last_seen = NOW(), updated_at = NOW() RETURNING *', [normalizeText(item.merchantName || "Unknown seller"), platform.name, normalizeUrl(item.merchantUrl || item.url, platform.base_url), item.contactInfo || {}, normalizeText(item.location) || null])).rows[0];
const createManualMerchant = async (payload) => {
  const platform = { name: normalizeText(payload.platform || "Manual"), base_url: payload.url };
  if (!payload.name || !payload.url) throw new Error("name and url are required");
  return upsertMerchant(platform, { merchantName: payload.name, merchantUrl: payload.url, contactInfo: payload.contactInfo || {}, location: payload.location });
};

const upsertListing = async (merchantId, item, baseUrl) => {
  const url = normalizeUrl(item.url, baseUrl);
  const title = normalizeText(item.title);
  if (!url || !title) return null;
  const fingerprint = fingerprintListing({ url, title });
  return (await query('INSERT INTO "FOUND_IT".listings (merchant_id, title, description, category, images, url, collection_location, posted_at, scraped_at, status, fingerprint) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),$9,$10) ON CONFLICT (fingerprint) DO UPDATE SET description = EXCLUDED.description, images = EXCLUDED.images, collection_location = EXCLUDED.collection_location, scraped_at = NOW(), status = EXCLUDED.status, updated_at = NOW() RETURNING *', [merchantId, title, normalizeText(item.description) || null, normalizeText(item.category) || "free", item.images || [], url, normalizeText(item.location) || null, item.postedAt || null, item.status || "active", fingerprint])).rows[0];
};

const createRun = async (platformId) => (await query('INSERT INTO "FOUND_IT".scrape_runs (platform_id, status) VALUES ($1, $2) RETURNING *', [platformId, "running"])).rows[0];
const finishRun = async (id, values) => (await query('UPDATE "FOUND_IT".scrape_runs SET status=$2, listings_seen=$3, listings_saved=$4, error=$5, finished_at=NOW() WHERE id=$1 RETURNING *', [id, values.status, values.seen || 0, values.saved || 0, values.error || null])).rows[0];
const createManualListing = async (payload) => {
  const platform = { name: normalizeText(payload.platform || "Manual"), base_url: payload.url };
  const merchant = await upsertMerchant(platform, payload);
  return upsertListing(merchant.id, payload, platform.base_url);
};
const updateListing = async (id, payload) => (await query('UPDATE "FOUND_IT".listings SET title=COALESCE($2,title), description=COALESCE($3,description), category=COALESCE($4,category), collection_location=COALESCE($5,collection_location), status=COALESCE($6,status), updated_at=NOW() WHERE id=$1 RETURNING *', [id, payload.title || null, payload.description ?? null, payload.category || null, payload.collectionLocation ?? null, payload.status || null])).rows[0];
const exportListing = async (id) => {
  const result = await query('UPDATE "FOUND_IT".listings SET status=$2, updated_at=NOW() WHERE id=$1 RETURNING *', [id, "exported"]);
  const listing = result.rows[0];
  if (!listing) return null;
  return { listingId: listing.id, onboardingPayload: { source: "FOUND_IT", title: listing.title, description: listing.description, category: listing.category, images: listing.images, sourceUrl: listing.url, collectionLocation: listing.collection_location } };
};
const exportMerchant = async (id) => {
  const merchant = (await query('SELECT * FROM "FOUND_IT".merchants WHERE id=$1', [id])).rows[0];
  if (!merchant) return null;
  return { merchantId: merchant.id, onboardingPayload: { source: "FOUND_IT", ownerName: merchant.name, businessName: merchant.name, platform: merchant.platform, sourceUrl: merchant.url, contactInfo: merchant.contact_info, location: merchant.location } };
};

module.exports = { listPlatforms, listMerchants, listListings, listRuns, addPlatform, updatePlatform, upsertMerchant, upsertListing, createRun, finishRun, createManualMerchant, createManualListing, updateListing, exportMerchant, exportListing };