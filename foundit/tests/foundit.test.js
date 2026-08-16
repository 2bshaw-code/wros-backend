const test = require("node:test");
const assert = require("node:assert/strict");
const { fingerprintListing, normalizeUrl } = require("../utils");
const { parseRssXml } = require("../scrapers/rss");
const { parseHtml } = require("../scrapers/html");
const { requireFoundItPermission } = require("../permissions");
const { founderMiddleware } = require("../../middleware/founderMiddleware");
const { requireTenant } = require("../../middleware/tenantMiddleware");

test("fingerprints ignore tracking parameters and title casing", () => {
  assert.equal(
    fingerprintListing({ url: "https://example.test/item?utm_source=test", title: " Free Chair " }),
    fingerprintListing({ url: "https://example.test/item", title: "free chair" })
  );
  assert.equal(normalizeUrl("/item", "https://example.test"), "https://example.test/item");
});

test("Freecycle RSS items map into unified listings", async () => {
  const xml = `<?xml version="1.0"?><rss version="2.0"><channel><title>London Freecycle</title><link>https://freecycle.example/london</link><item><title>Free desk</title><link>https://freecycle.example/items/desk</link><description>Collection only</description><pubDate>Sat, 16 Aug 2026 10:00:00 GMT</pubDate></item></channel></rss>`;
  const [item] = await parseRssXml({ name: "Freecycle", config: { regions: { "https://feed.example/london": "London" } } }, "https://feed.example/london", xml);
  assert.equal(item.title, "Free desk");
  assert.equal(item.location, "London");
  assert.equal(item.merchantName, "London Freecycle");
});

test("HTML adapter uses configurable selectors", () => {
  const html = '<article class="result"><a href="/desk"><h2>Free desk</h2></a><p>Collection only</p><span class="place">Leeds</span></article>';
  const [item] = parseHtml({ name: "Test", base_url: "https://example.test", config: { selectors: { item: ".result", title: "h2", location: ".place" } } }, "https://example.test/free", html);
  assert.equal(item.url, "https://example.test/desk");
  assert.equal(item.location, "Leeds");
});

test("role permissions separate founders, owners, and merchants", () => {
  const response = { statusCode: 0, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  let allowed = false;
  requireFoundItPermission("manage")({ user: { role: "founder_admin" } }, response, () => { allowed = true; });
  assert.equal(allowed, true);
  allowed = false;
  requireFoundItPermission("manage")({ user: { role: "owner" } }, response, () => { allowed = true; });
  assert.equal(allowed, false);
  assert.equal(response.statusCode, 403);
  requireFoundItPermission("view")({ user: { role: "merchant" } }, response, () => { allowed = true; });
  assert.equal(response.statusCode, 403);
});

test("founder_master has control-plane access but cannot bypass tenant context", () => {
  const response = { statusCode: 0, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  let founderAllowed = false;
  founderMiddleware({ user: { role: "founder_master" } }, response, () => { founderAllowed = true; });
  assert.equal(founderAllowed, true);
  let foundItAllowed = false;
  requireFoundItPermission("manage")({ user: { role: "founder_master" } }, response, () => { foundItAllowed = true; });
  assert.equal(foundItAllowed, true);
  let tenantAllowed = false;
  requireTenant({ user: { role: "founder_master" } }, response, () => { tenantAllowed = true; });
  assert.equal(tenantAllowed, false);
  assert.equal(response.statusCode, 403);
});