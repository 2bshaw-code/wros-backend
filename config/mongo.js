const mongoose = require("mongoose");
const { MONGO_URI, NODE_ENV } = require("./env");

const connectMongo = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

if (NODE_ENV !== "test") {
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection failed:", err.message);
  });
}

module.exports = { connectMongo };
