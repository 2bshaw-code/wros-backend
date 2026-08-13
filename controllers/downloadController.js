const { sendSuccess, sendError } = require("../utils/response");
const { getDownload } = require("../services/downloadService");

const download = (req, res) => {
  try {
    const item = getDownload(req.params.platform);
    sendSuccess(res, item, 200);
  } catch (error) {
    sendError(res, error.message, 503);
  }
};

module.exports = { download };