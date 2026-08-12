const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

const JWT_SECRET = process.env.JWT_SECRET || "wros-dev-secret";

const registerAdmin = async ({ email, password, role = "admin" }) => {
  const existingUser = await AdminUser.findOne({ email });
  if (existingUser) {
    throw new Error("Admin user already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new AdminUser({ email, passwordHash, role });
  const savedUser = await user.save();

  const token = jwt.sign(
    { id: savedUser._id, email: savedUser.email, role: savedUser.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    token,
    user: {
      id: savedUser._id,
      email: savedUser.email,
      role: savedUser.role,
    },
  };
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

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = {
  registerAdmin,
  loginAdmin,
};
