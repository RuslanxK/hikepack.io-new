const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const copyS3ObjectWithNewKey = async (originalUrl, folder = "trips") => {
  const bucket = process.env.AWS_S3_BUCKET_NAME;

  try {
    const urlParts = originalUrl.split(`.amazonaws.com/`);
    if (urlParts.length < 2) throw new Error("Invalid S3 URL format");

    const originalKey = urlParts[1];
    const fileName = path.basename(originalKey);
    const sanitizedFileName = fileName.toLowerCase().replace(/[^a-z0-9.\-_]/g, "");
    const newKey = `${folder}/${uuidv4()}-${sanitizedFileName}`;

    const params = {
      Bucket: bucket,
      CopySource: `${bucket}/${originalKey}`,
      Key: newKey,
    };

    await s3.copyObject(params).promise();

    return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`;
  } catch (error) {
    console.error("S3 image copy failed:", error);
    throw new Error("S3 image duplication failed");
  }
};

module.exports = copyS3ObjectWithNewKey;
