const { sendSuccess, sendError } = require("../utils/response");
const { registerAdmin, loginAdmin } = require("../services/authService");

const register = async (req, res) => {
  try {
    const result = await registerAdmin(req.body);
    sendSuccess(res, result, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const login = async (req, res) => {
  try {
    const result = await loginAdmin(req.body);
    sendSuccess(res, result, 200);
  } catch (error) {
    sendError(res, error.message, 401);
  }
};

module.exports = {
  register,
  login,
};
