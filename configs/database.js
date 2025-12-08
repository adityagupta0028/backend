// require("dotenv").config();
// const mongoose = require("mongoose");

// const connectToDB = async () => {
//   let dbUrl;
//   switch (process.env.NODE_ENV) {
//     case "production":
//       dbUrl = process.env.MONGODB_URI_PRODUCTION;
//       break;
//     case "development":
//       dbUrl = process.env.MONGODB_URI_DEVELOPMENT;
//       break;
//     case "local":
//     default:
//       dbUrl = process.env.MONGODB_URI_LOCAL;
//       break;
//   }
//   if (!dbUrl) {
//     console.error("MongoDB URI is missing for current environment");
//     process.exit(1);
//   }

//   try {
//     await mongoose.connect(dbUrl, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("NODE_ENV:", process.env.NODE_ENV, process.env.MONGODB_URI_DEVELOPMENT);
//     console.log(`MongoDB connected ${process.env.NODE_ENV}`);
//   } catch (err) {
//     console.error("MongoDB connection error:", err.message);
//     process.exit(1);
//   }
// };

// module.exports = connectToDB;


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

    console.log("NODE_ENV:", process.env.NODE_ENV, dbUrl);
    console.log(`MongoDB connected (${process.env.NODE_ENV})`);

    // 🔥 IMPORTANT: Drop bad compound index on parallel arrays if it exists
    const collectionName = "products"; // Default from Product model

    const collections = await mongoose.connection.db
      .listCollections({ name: collectionName })
      .toArray();

    if (!collections.length) {
      console.log(`Collection "${collectionName}" does not exist yet, skipping index cleanup.`);
      return;
    }

    const indexes = await mongoose.connection.db
      .collection(collectionName)
      .indexes();

  

    const badIndex = indexes.find(
      (idx) =>
        idx.key &&
        typeof idx.key === "object" &&
        idx.key.categoryId === 1 &&
        idx.key.subCategoryId === 1
    );

    if (badIndex) {
      console.log("Dropping bad index:", badIndex.name, badIndex.key);
      await mongoose.connection.db
        .collection(collectionName)
        .dropIndex(badIndex.name);
      console.log("Bad compound index dropped successfully.");
    } else {
      console.log("No bad compound index (categoryId + subCategoryId) found. 👍");
    }
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectToDB;

