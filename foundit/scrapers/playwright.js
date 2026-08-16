const { chromium } = require("playwright-core");
const { assertRobotsAllowed, USER_AGENT } = require("./http");
const { normalizeUrl } = require("../utils");

const scrapePlaywright = async (platform) => {
  const executablePath = process.env.FOUND_IT_BROWSER_EXECUTABLE;
  if (!executablePath) throw new Error("FOUND_IT_BROWSER_EXECUTABLE is required for Playwright platforms");
  const targetUrl = normalizeUrl(platform.config?.searchUrl || platform.config?.searchPath || platform.base_url, platform.base_url);
  await assertRobotsAllowed(targetUrl);
  const browser = await chromium.launch({ executablePath, headless: true });
  try {
    const page = await browser.newPage({ userAgent: USER_AGENT });
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: Number(process.env.FOUND_IT_BROWSER_TIMEOUT_MS || 30000) });
    const selectors = { item: "article, [data-testid^='product-item'], .feed-item", link: "a[href]", title: "h2, h3, [data-testid='title']", description: "p", location: "[data-testid='location'], .location", image: "img", ...(platform.config?.selectors || {}) };
    return await page.locator(selectors.item).evaluateAll((elements, values) => elements.map((element) => {
      const query = (selector) => element.querySelector(selector);
      const link = query(values.link);
      const image = query(values.image);
      return { title: query(values.title)?.textContent?.trim() || link?.textContent?.trim(), description: query(values.description)?.textContent?.trim(), url: link?.href, images: image?.src ? [image.src] : [], location: query(values.location)?.textContent?.trim(), merchantName: `${values.platformName} member`, merchantUrl: link?.href, category: "free" };
    }), { ...selectors, platformName: platform.name });
  } finally {
    await browser.close();
  }
};

module.exports = { scrapePlaywright };