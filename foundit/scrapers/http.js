const robotsParser = require("robots-parser");

const USER_AGENT = process.env.FOUND_IT_USER_AGENT || "FoundITBot/1.0 (+https://www.wros.co.uk/contact)";

const assertRobotsAllowed = async (targetUrl) => {
  const url = new URL(targetUrl);
  const robotsUrl = `${url.origin}/robots.txt`;
  try {
    const response = await fetch(robotsUrl, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) return;
    const robots = robotsParser(robotsUrl, await response.text());
    if (!robots.isAllowed(targetUrl, USER_AGENT)) throw new Error(`robots.txt disallows scraping ${targetUrl}`);
  } catch (error) {
    if (error.message.startsWith("robots.txt disallows")) throw error;
  }
};

const fetchPublic = async (url, options = {}) => {
  await assertRobotsAllowed(url);
  const response = await fetch(url, {
    ...options,
    headers: { "User-Agent": USER_AGENT, Accept: options.accept || "text/html,application/xhtml+xml", ...(options.headers || {}) },
    signal: AbortSignal.timeout(Number(process.env.FOUND_IT_HTTP_TIMEOUT_MS || 20000)),
  });
  if (!response.ok) throw new Error(`${response.status} response from ${new URL(url).hostname}`);
  return response;
};

module.exports = { USER_AGENT, assertRobotsAllowed, fetchPublic };