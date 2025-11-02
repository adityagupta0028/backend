require("dotenv").config();
const mongoose = require("mongoose");

const connectToDB = async () => {
  let dbUrl;
  switch (process.env.NODE_ENV) {
    case "production":
      dbUrl = process.env.MONGODB_URI_PRODUCTION;
      break;
    case "development":
      dbUrl = process.env.MONGODB_URI_DEVELOPMENT;
      break;
    case "local":
    default:
      dbUrl = process.env.MONGODB_URI_LOCAL;
      break;
  }
  if (!dbUrl) {
    console.error("MongoDB URI is missing for current environment");
    process.exit(1);
  }

  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("NODE_ENV:", process.env.NODE_ENV, process.env.MONGODB_URI_DEVELOPMENT);
    console.log(`MongoDB connected ${process.env.NODE_ENV}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectToDB;
