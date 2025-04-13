// utils/uploadToS3.js
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const uploadToS3 = (file, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject("No file provided");
    }

    // Sanitize filename: replace spaces and special characters
    const sanitizedFileName = file.originalname
      .toLowerCase()                    // Convert to lowercase
      .replace(/\s+/g, "-")              // Replace spaces with hyphens
      .replace(/[^a-z0-9.\-_]/g, "");    // Remove special characters

    const fileKey = `${folder}/${uuidv4()}-${sanitizedFileName}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.error("S3 Upload Error:", err);
        reject(err);
      }

      // Construct and return the full URL
      const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
      resolve(fileUrl);
    });
  });
};

module.exports = uploadToS3;
