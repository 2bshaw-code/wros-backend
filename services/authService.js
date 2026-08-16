const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const userRepository = require("../auth/userRepository");
const Business = require("../models/Business");
const { initializeMerchantWorkspace } = require("./businessService");
const config = require("../config");
const { getPlan } = require("./billingService");
const { getRolePermissions } = require("../security/permissions");

const JWT_SECRET = config.JWT_SECRET;
const REFRESH_TOKEN_SECRET = config.REFRESH_TOKEN_SECRET;

const toUser = (user) => ({
  id: user.id,
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
    workspaceConnected: Boolean(business.workspaceConnected),
    plan: getPlan(business.subscriptionPlan),
  };
};

const createAccessToken = (claims) => jwt.sign(claims, JWT_SECRET, { expiresIn: "1h" });

const createRefreshToken = (user) => {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { id: user.id, email: user.email, type: "refresh", jti },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { token, jti };
};

const createSession = async (user) => {
  const { token: refreshToken, jti } = createRefreshToken(user);
  await userRepository.updateSession(user.id, { refreshTokenHash: await bcrypt.hash(refreshToken, 10), refreshTokenId: jti });

  const requiresMerchant = user.role === "merchant" || user.role === "manager" || user.role === "tenant_admin" || user.role === "operator";
  if (user.role === "merchant") await initializeMerchantWorkspace(user);
  const merchant = requiresMerchant ? await getMerchantContext(user) : null;
  const claims = { ...toUser(user), ...(merchant || {}) };

  return {
    token: createAccessToken(claims),
    refreshToken,
    user: claims,
  };
};

const registerAdmin = async ({ email, password, role = "merchant" }) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new Error("Admin user already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  return createSession(await userRepository.createUser({ email, passwordHash, role }));
};

const loginAdmin = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  return createSession(user);
};

const resolveConsoleRole = (role) => {
  if (role === "founder_master") return "founder_master";
  if (role === "founder" || role === "founder_admin") return "founder_admin";
  if (role === "owner") return "owner";
  if (role === "admin") return "admin";
  if (role === "manager") return "tenant_admin";
  if (role === "merchant") return "tenant_admin";
  return "operator";
};

const loginConsoleOperator = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user || user.role === "customer") {
    throw new Error("Invalid console email or password");
  }

  const isValid = await bcrypt.compare(password || "", user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid console email or password");
  }

  if (user.role === "merchant" || user.role === "manager" || user.role === "tenant_admin") {
    await initializeMerchantWorkspace(user);
  }
  const requiresMerchant = user.role === "merchant" || user.role === "manager" || user.role === "tenant_admin" || user.role === "operator";
  const merchant = requiresMerchant ? await getMerchantContext(user) : null;
  if (requiresMerchant && !merchant) {
    throw new Error("No merchant subscription is associated with this console user");
  }

  const operatorRole = resolveConsoleRole(user.role);
  const plan = merchant?.plan;
  const permissions = getRolePermissions(operatorRole);
  const claims = {
    ...toUser(user),
    ...(merchant || {}),
    founder: Boolean(user.founder || user.role === "founder_master"),
    operatorRole,
    plan,
    permissions,
  };

  const { token: refreshToken, jti } = createRefreshToken(user);
  await userRepository.updateSession(user.id, { refreshTokenHash: await bcrypt.hash(refreshToken, 10), refreshTokenId: jti });

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

  const user = await userRepository.findById(decoded.id);
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
