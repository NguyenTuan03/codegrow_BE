const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config();
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});
const upload = ({key, body, fileType}) => {
    return new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: body || null,
        ContentType: fileType,        
    });
};
const createUrlS3 = (key) => {
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
module.exports = {s3, upload, createUrlS3};
