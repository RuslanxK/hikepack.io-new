const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const deleteFromS3 = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    // Extract the file key from the URL
    const urlParts = imageUrl.split("/");
    const fileKey = urlParts.slice(3).join("/");

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
    };

    await s3.deleteObject(params).promise();
    console.log(`Deleted from S3: ${fileKey}`);
  } catch (err) {
    console.error("S3 Deletion Error:", err);
  }
};

module.exports = deleteFromS3;
