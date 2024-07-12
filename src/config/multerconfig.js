// multer-config.js

const multer = require('multer');
const multerS3 = require('multer-s3');
const awsConfig = require('../config/awsconfig'); // Corrected import path
require('dotenv').config();

const upload = multer({
  storage: multerS3({
    s3: awsConfig, // Pass the S3 instance here
    bucket: process.env.S3_BUCKET_NAME, // Correct bucket name environment variable
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read', // Adjust permissions as needed
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname); // Unique key generation
    },
  }),
});

module.exports = upload;
