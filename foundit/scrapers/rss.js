const Parser = require("rss-parser");
const { fetchPublic } = require("./http");
const { normalizeText } = require("../utils");

const parser = new Parser();

const parseRssXml = async (platform, feedUrl, xml) => {
  const feed = await parser.parseString(xml);
  return (feed.items || []).map((item) => ({
        title: item.title,
        description: item.contentSnippet || item.content || item.summary,
        category: item.categories?.[0] || "free",
        images: item.enclosure?.url ? [item.enclosure.url] : [],
        url: item.link || item.guid,
        merchantName: normalizeText(item.creator || feed.title || `${platform.name} member`),
        merchantUrl: item.link || feed.link || feedUrl,
        location: platform.config?.regions?.[feedUrl] || normalizeText(item.location),
        postedAt: item.isoDate || item.pubDate || null,
      }));
};

const scrapeRss = async (platform) => {
  const feedUrls = Array.isArray(platform.config?.feedUrls) ? platform.config.feedUrls : [];
  if (!feedUrls.length) throw new Error(`${platform.name} requires config.feedUrls with regional RSS feeds`);
  const listings = [];
  for (const feedUrl of feedUrls) {
    const xml = await (await fetchPublic(feedUrl, { accept: "application/rss+xml,application/xml,text/xml" })).text();
    listings.push(...await parseRssXml(platform, feedUrl, xml));
  }
  return listings;
};

module.exports = { parseRssXml, scrapeRss };