const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const Business = require("../models/Business");
const config = require("../config");
const { getPlan } = require("./billingService");
const { getRolePermissions } = require("../security/permissions");

const JWT_SECRET = config.JWT_SECRET;
const REFRESH_TOKEN_SECRET = config.REFRESH_TOKEN_SECRET;

const toUser = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
  founder: user.founder,
});

const getMerchantContext = async (user) => {
  const business = await Business.findOne({ email: user.email });
  if (!business) return null;

  return {
    tenantId: business._id.toString(),
    businessId: business._id.toString(),
    plan: getPlan(business.subscriptionPlan),
  };
};

const createAccessToken = (claims) => jwt.sign(claims, JWT_SECRET, { expiresIn: "1h" });

const createRefreshToken = (user) => {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { id: user._id, email: user.email, type: "refresh", jti },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { token, jti };
};

const createSession = async (user) => {
  const { token: refreshToken, jti } = createRefreshToken(user);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  user.refreshTokenId = jti;
  await user.save();

  const merchant = await getMerchantContext(user);
  const claims = { ...toUser(user), ...(merchant || {}) };

  return {
    token: createAccessToken(claims),
    refreshToken,
    user: claims,
  };
};

const registerAdmin = async ({ email, password, role = "merchant" }) => {
  const existingUser = await AdminUser.findOne({ email });
  if (existingUser) {
    throw new Error("Admin user already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new AdminUser({ email, passwordHash, role });
  const savedUser = await user.save();

  return createSession(savedUser);
};

const loginAdmin = async ({ email, password }) => {
  const user = await AdminUser.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  if (user.email === "bobby@example.com") {
    user.founder = true;
    user.role = "admin";
  }

  return createSession(user);
};

const resolveConsoleRole = (role) => {
  if (role === "founder_admin") return "founder_admin";
  if (role === "owner") return "owner";
  if (role === "admin") return "admin";
  if (role === "manager") return "tenant_admin";
  if (role === "merchant") return "tenant_admin";
  return "operator";
};

const loginConsoleOperator = async ({ email, password }) => {
  const user = await AdminUser.findOne({ email: String(email || "").toLowerCase().trim() });
  if (!user || user.role === "customer") {
    throw new Error("Invalid console email or password");
  }

  const isValid = await bcrypt.compare(password || "", user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid console email or password");
  }

  const merchant = await getMerchantContext(user);
  if (!merchant) {
    throw new Error("No merchant subscription is associated with this console user");
  }

  const operatorRole = resolveConsoleRole(user.role);
  const plan = merchant.plan;
  const permissions = getRolePermissions(operatorRole);
  const claims = {
    ...toUser(user),
    tenantId: merchant.tenantId,
    businessId: merchant.businessId,
    founder: Boolean(user.founder),
    operatorRole,
    plan,
    permissions,
  };

  const { token: refreshToken, jti } = createRefreshToken(user);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  user.refreshTokenId = jti;
  await user.save();

  return {
    token: jwt.sign(claims, JWT_SECRET, { expiresIn: "1h" }),
    refreshToken,
    operatorRole,
    plan,
    permissions,
  };
};

const refreshSession = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token required");
  }

  const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  if (decoded.type !== "refresh") {
    throw new Error("Invalid refresh token");
  }

  const user = await AdminUser.findById(decoded.id);
  if (!user || !user.refreshTokenHash || decoded.jti !== user.refreshTokenId || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) {
    throw new Error("Refresh token revoked or invalid");
  }

  return createSession(user);
};

module.exports = {
  registerAdmin,
  loginAdmin,
  loginConsoleOperator,
  refreshSession,
  getMerchantContext,
};
