const repository = require("../repository");
const { scrapeRss } = require("./rss");
const { scrapeHtml } = require("./html");
const { scrapePlaywright } = require("./playwright");
const { scrapeEbay } = require("./ebay");

const adapters = { rss: scrapeRss, html: scrapeHtml, playwright: scrapePlaywright, ebay_api: scrapeEbay };
let running = false;
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const runPlatform = async (platform) => {
  const run = await repository.createRun(platform.id);
  try {
    const items = await adapters[platform.scrape_method](platform);
    let saved = 0;
    const throttleMs = Math.max(0, Number(platform.config?.throttleMs ?? process.env.FOUND_IT_THROTTLE_MS ?? 750));
    for (const item of items) {
      const merchant = await repository.upsertMerchant(platform, item);
      if (await repository.upsertListing(merchant.id, item, platform.base_url)) saved += 1;
      if (throttleMs) await wait(throttleMs);
    }
    return repository.finishRun(run.id, { status: "completed", seen: items.length, saved });
  } catch (error) {
    await repository.finishRun(run.id, { status: "failed", error: error.message });
    throw error;
  }
};

const runScrapers = async ({ platformId } = {}) => {
  if (running) return { accepted: false, reason: "A Found IT scrape is already running" };
  running = true;
  try {
    const platforms = (await repository.listPlatforms({ includeSecrets: true })).filter((platform) => platform.active && (!platformId || String(platform.id) === String(platformId)));
    const results = [];
    for (const platform of platforms) {
      try { results.push({ platform: platform.name, run: await runPlatform(platform) }); }
      catch (error) { results.push({ platform: platform.name, error: error.message }); }
      if (platforms.length > 1) await wait(Math.max(0, Number(process.env.FOUND_IT_PLATFORM_THROTTLE_MS || 1500)));
    }
    return { accepted: true, platforms: results };
  } finally { running = false; }
};

module.exports = { adapters, runPlatform, runScrapers };