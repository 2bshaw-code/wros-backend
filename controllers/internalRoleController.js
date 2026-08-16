const crypto = require("crypto");
const AdminUser = require("../models/AdminUser");
const { sendSuccess, sendError } = require("../utils/response");

const allowedRoles = new Set(["founder_admin", "owner", "merchant"]);

const keysMatch = (providedKey, expectedKey) => {
  if (!providedKey || !expectedKey) return false;
  const provided = Buffer.from(String(providedKey));
  const expected = Buffer.from(String(expectedKey));
  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
};

const assignRole = async (req, res) => {
  const internalKey = process.env.INTERNAL_ROLE_KEY;
  if (!internalKey) return sendError(res, "Role assignment is not configured", 503);

  const providedKey = req.headers["x-internal-role-key"] || req.body?.key;
  if (!keysMatch(providedKey, internalKey)) return sendError(res, "Forbidden", 403);

  const email = String(req.body?.email || "").trim().toLowerCase();
  const role = String(req.body?.role || "").trim();
  if (!email) return sendError(res, "Email is required", 400);
  if (!allowedRoles.has(role)) return sendError(res, "Invalid role", 400);

  try {
    const user = await AdminUser.findOneAndUpdate(
      { email },
      { $set: { role, founder: role === "founder_admin", refreshTokenHash: "", refreshTokenId: "" } },
      { returnDocument: "after", runValidators: true }
    );

    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, {
      email: user.email,
      role: user.role,
      message: "Role assigned successfully. The user must sign in again.",
    });
  } catch (error) {
    console.error("Internal role assignment failed:", error.message);
    return sendError(res, "Internal server error", 500);
  }
};

module.exports = { assignRole, allowedRoles, keysMatch };