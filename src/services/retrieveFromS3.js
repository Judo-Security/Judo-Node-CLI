const aws = require('aws-sdk');
const fetch = require('node-fetch');
const CheckForError = require('./errorHandler');
const logger = require('../utils/logger');

require('dotenv').config();

const credentials = {
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY
};

aws.config.update({
  credentials: credentials,
  region: process.env.S3_REGION,
});

var s3 = new aws.S3();



async function retrieveFromS3({ inputFile, bucketName }) {
  const preSignedUrl = s3.getSignedUrl('getObject', {
    Bucket: bucketName,
    Key: inputFile,
    Expires: 100,
  });
  try {
    const result = await fetch(preSignedUrl, {
      method: 'GET',
    });
    return await result.json();
  }
  catch (error) {
    return CheckForError;
  }
}

module.exports = retrieveFromS3;