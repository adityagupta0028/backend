require("dotenv").config();
const { uploadFileToS3 } = require("../services/uploadS3Service");
const fs = require("fs");


const uploadFile = async (file) => {
  try {
    const fileFullPath = file?.path; 
    let filePath = `uploads/${Date.now()}-${file?.originalname}`; 
    const fileUrl = await uploadFileToS3(fileFullPath, process.env.AWS_S3_BUCKET_NAME, filePath);
     fs.unlinkSync(fileFullPath);
     filePath ="/"+filePath;
    return { filePath, fileUrl };
  } catch (error) {
    throw error;
  }
};

module.exports = uploadFile;
