const { sendSuccess, sendError } = require("../utils/response");
const { registerAdmin, loginAdmin, loginConsoleOperator, refreshSession } = require("../services/authService");

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/auth/refresh",
};

const setRefreshCookie = (res, refreshToken) => res.cookie("wros_refresh", refreshToken, refreshCookieOptions);

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
    const result = await registerAdmin(req.body);
    sendSession(req, res, result, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const login = async (req, res) => {
  try {
    const result = await loginAdmin(req.body);
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

module.exports = {
  register,
  login,
  consoleSignIn,
  refresh,
};
