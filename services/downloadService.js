const DOWNLOAD_URLS = Object.freeze({
  ios: process.env.WROS_IOS_DOWNLOAD_URL || "",
  android: process.env.WROS_ANDROID_DOWNLOAD_URL || "",
  mac: process.env.WROS_MAC_DOWNLOAD_URL || "",
  windows: process.env.WROS_WINDOWS_DOWNLOAD_URL || "",
});

const getDownload = (platform) => {
  const normalizedPlatform = String(platform || "").toLowerCase();
  const url = DOWNLOAD_URLS[normalizedPlatform];

  if (!url) {
    throw new Error(`Download is not configured for ${normalizedPlatform}`);
  }

  return { platform: normalizedPlatform, url };
};

module.exports = { getDownload };