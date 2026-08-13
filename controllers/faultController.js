const fs = require("fs");
const { sendSuccess, sendError } = require("../utils/response");
const { createFaultReport } = require("../services/faultService");

const reportFault = async (req, res) => {
  try {
    if (req.file) {
      const content = fs.readFileSync(req.file.path);
      const isPng = content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const isJpeg = content.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
      const isWebp = content.subarray(0, 4).toString() === "RIFF" && content.subarray(8, 12).toString() === "WEBP";
      if (!isPng && !isJpeg && !isWebp) {
        fs.unlinkSync(req.file.path);
        return sendError(res, "Uploaded screenshot is not a valid image", 400);
      }
    }

    const result = await createFaultReport({
      tenantId: req.tenantId,
      merchantId: req.tenantId,
      operatorId: req.user?.id,
      issueTitle: req.body?.issue_title,
      description: req.body?.description,
      screenshotUrl: req.file ? `/uploads/${req.file.filename}` : "",
      contactEmail: req.body?.contact_email,
    });
    sendSuccess(res, result, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

module.exports = { reportFault };