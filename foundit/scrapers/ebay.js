const { fetchPublic } = require("./http");

const scrapeEbay = async (platform) => {
  const token = platform.api_key || (platform.config?.apiKeyEnv ? process.env[platform.config.apiKeyEnv] : process.env.FOUND_IT_EBAY_TOKEN);
  if (!token) throw new Error("eBay requires FOUND_IT_EBAY_TOKEN or config.apiKeyEnv");
  const query = encodeURIComponent(platform.config?.query || "free collection only");
  const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${query}&limit=50&filter=price:[0..0],deliveryOptions:{SELLER_ARRANGED_LOCAL_PICKUP}`;
  const response = await fetchPublic(url, { accept: "application/json", headers: { Authorization: `Bearer ${token}`, "X-EBAY-C-MARKETPLACE-ID": "EBAY_GB" } });
  const data = await response.json();
  return (data.itemSummaries || []).map((item) => ({ title: item.title, description: item.shortDescription, category: item.categories?.[0]?.categoryName || "free", images: [item.image?.imageUrl, ...(item.thumbnailImages || []).map((image) => image.imageUrl)].filter(Boolean), url: item.itemWebUrl, merchantName: item.seller?.username || "eBay seller", merchantUrl: item.itemAffiliateWebUrl || item.itemWebUrl, location: [item.itemLocation?.postalCode, item.itemLocation?.country].filter(Boolean).join(", "), postedAt: null }));
};

module.exports = { scrapeEbay };