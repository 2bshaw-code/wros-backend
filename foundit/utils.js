const crypto = require("crypto");

const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();
const normalizeUrl = (value, baseUrl) => {
  try {
    const url = new URL(value, baseUrl);
    url.hash = "";
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => url.searchParams.delete(key));
    return url.toString();
  } catch {
    return normalizeText(value);
  }
};
const fingerprintListing = ({ url, title }) => crypto.createHash("sha256").update(`${normalizeUrl(url)}|${normalizeText(title).toLowerCase()}`).digest("hex");

module.exports = { normalizeText, normalizeUrl, fingerprintListing };