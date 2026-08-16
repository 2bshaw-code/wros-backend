const cheerio = require("cheerio");
const { fetchPublic } = require("./http");
const { normalizeText, normalizeUrl } = require("../utils");

const defaults = {
  item: "article, [data-q='search-result'], .listing-maxi, .feed-item",
  link: "a[href]",
  title: "h2, h3, [data-q='tile-title'], .listing-title",
  description: "p, .description",
  location: "[data-q='tile-location'], .location",
  image: "img",
  merchant: "[data-q='seller-name'], .seller-name",
};

const parseHtml = (platform, targetUrl, html) => {
  const $ = cheerio.load(html);
  const selectors = { ...defaults, ...(platform.config?.selectors || {}) };
  const requiredPattern = platform.config?.requiredPattern ? new RegExp(platform.config.requiredPattern, "i") : null;
  const items = [];
  $(selectors.item).each((index, element) => {
    const root = $(element);
    const link = root.find(selectors.link).first();
    const url = normalizeUrl(link.attr("href"), targetUrl);
    const title = normalizeText(root.find(selectors.title).first().text() || link.text());
    const description = normalizeText(root.find(selectors.description).first().text());
    const combined = `${title} ${description}`;
    if (!url || !title || (requiredPattern && !requiredPattern.test(combined))) return;
    const image = root.find(selectors.image).first().attr("src") || root.find(selectors.image).first().attr("data-src");
    items.push({ title, description, category: "free", url, images: image ? [normalizeUrl(image, targetUrl)] : [], location: normalizeText(root.find(selectors.location).first().text()), merchantName: normalizeText(root.find(selectors.merchant).first().text()) || `${platform.name} member`, merchantUrl: url });
  });
  return items;
};

const scrapeHtml = async (platform) => {
  const targetUrl = normalizeUrl(platform.config?.searchUrl || platform.base_url, platform.base_url);
  const html = await (await fetchPublic(targetUrl)).text();
  return parseHtml(platform, targetUrl, html);
};

module.exports = { defaults, parseHtml, scrapeHtml };