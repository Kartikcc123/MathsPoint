const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const crypto = require('crypto');

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (fileBuffer, originalName, mimeType, folder = 'advertisements') => {
  const fileExtension = path.extname(originalName);
  const randomName = crypto.randomBytes(16).toString('hex');
  const fileName = `${folder}/${randomName}${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
    // ACL: 'public-read', // If needed based on bucket configuration
  });

  await s3Client.send(command);
  
  const bucketName = process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME;
  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

const deleteFromS3 = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    const bucketName = process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME;
    const bucketUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
    const fileKey = fileUrl.replace(bucketUrl, '');

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3,
};
