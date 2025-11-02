const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const fs = require("fs");
require("dotenv").config();
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const uploadFileToS3 = async (filePath, bucketName, key) => {
  try {
    const fileStream = fs.createReadStream(filePath);
    const mime = await import("mime"); 
    const contentType = mime.default.getType(filePath);
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: fileStream,
        ContentType: contentType,
        //ACL: "public-read",
      },
    });
    const result = await upload.done();
    return result.Location; 
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

module.exports = { uploadFileToS3 };
