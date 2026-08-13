const mongoose = require("mongoose");
const { MONGO_URI, NODE_ENV } = require("./env");

const connectMongo = async () => {
  if (!MONGO_URI) throw new Error("MONGO_URI is not defined");
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000, maxPoolSize: 20, retryWrites: true });
      console.log("MongoDB connected successfully");
      return mongoose.connection;
    } catch (error) {
      lastError = error;
      console.error(`MongoDB connection attempt ${attempt}/5 failed:`, error.message);
      if (attempt < 5) await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw lastError;
};

if (NODE_ENV !== "test") {
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection failed:", err.message);
  });
}

module.exports = { connectMongo };
