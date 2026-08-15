const { sendSuccess, sendError } = require("../utils/response");
const { registerAdmin, loginAdmin, loginConsoleOperator, refreshSession } = require("../services/authService");

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/auth/refresh",
};

const setRefreshCookie = (res, refreshToken) => res.cookie("wros_refresh", refreshToken, refreshCookieOptions);

const parseCredentials = (body, { requireStrongPassword = false } = {}) => {
  const email = String(body?.email || "").trim().toLowerCase();
  const password = typeof body?.password === "string" ? body.password : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("A valid email address is required");
  if (!password) throw new Error("Password is required");
  if (requireStrongPassword && password.length < 8) throw new Error("Password must be at least 8 characters");
  return { email, password };
};

const sendSession = (req, res, result, statusCode) => {
  setRefreshCookie(res, result.refreshToken);
  if (req.headers["x-wros-client"] === "mobile") {
    res.setHeader("x-refresh-token", result.refreshToken);
  }
  sendSuccess(res, { token: result.token, user: result.user }, statusCode);
};

const getRefreshCookie = (req) => req.headers.cookie
  ?.split(";")
  .map((cookie) => cookie.trim().split("="))
  .find(([name]) => name === "wros_refresh")?.[1];

const getRefreshToken = (req) => req.headers["x-refresh-token"] || getRefreshCookie(req);

const register = async (req, res) => {
  try {
    const result = await registerAdmin(parseCredentials(req.body, { requireStrongPassword: true }));
    sendSession(req, res, result, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const login = async (req, res) => {
  console.info(`[auth] sign-in request reached: ${req.method} ${req.originalUrl}`);
  try {
    const result = await loginAdmin(parseCredentials(req.body));
    sendSession(req, res, result, 200);
  } catch (error) {
    sendError(res, error.message, 401);
  }
};

const consoleSignIn = async (req, res) => {
  try {
    const result = await loginConsoleOperator(req.body || {});
    setRefreshCookie(res, result.refreshToken);
    sendSuccess(res, result, 200);
  } catch (error) {
    sendError(res, error.message, 401);
  }
};

const refresh = async (req, res) => {
  try {
    const result = await refreshSession(getRefreshToken(req));
    sendSession(req, res, result, 200);
  } catch (error) {
    res.clearCookie("wros_refresh", refreshCookieOptions);
    sendError(res, error.message, 401);
  }
};

const me = (req, res) => sendSuccess(res, req.user, 200);

module.exports = {
  register,
  login,
  consoleSignIn,
  refresh,
  me,
};
