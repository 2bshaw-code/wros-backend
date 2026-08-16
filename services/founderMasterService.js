const bcrypt = require("bcrypt");
const userRepository = require("../auth/userRepository");

const DEFAULT_EMAIL = "bobby@founder.master";

const seedFounderMaster = async () => {
  if (process.env.FOUNDER_MASTER_SEED_ENABLED !== "true") return { seeded: false, reason: "disabled" };

  const email = String(process.env.FOUNDER_MASTER_EMAIL || DEFAULT_EMAIL).trim().toLowerCase();
  const password = process.env.FOUNDER_MASTER_PASSWORD;
  if (!password || password.length < 12) throw new Error("FOUNDER_MASTER_PASSWORD must contain at least 12 characters");

  const existing = await userRepository.findByEmail(email);
  const passwordHash = existing && await bcrypt.compare(password, existing.passwordHash)
    ? existing.passwordHash
    : await bcrypt.hash(password, 12);

  const user = await userRepository.upsertFounderMaster({ email, passwordHash });

  console.info("Founder master account synchronized", { email: user.email, role: user.role });
  return { seeded: true, email: user.email, role: user.role };
};

module.exports = { DEFAULT_EMAIL, seedFounderMaster };