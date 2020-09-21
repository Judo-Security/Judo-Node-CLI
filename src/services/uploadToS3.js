const aws = require('aws-sdk');
const fetch = require('node-fetch');
const CheckForError = require('./errorHandler');
const logger = require('../utils/logger');

require('dotenv').config();

const credentials = {
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY
};

var s3 = new aws.S3();

function uploadToS3({ judoFile, outputFile, bucketName }) {
  const preSignedUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: outputFile,
    Expires: 100,
    ContentType: 'application/json'
  });
  return fetch(preSignedUrl, {
    method: 'PUT',
    body: JSON.stringify(judoFile),
    headers: {
      'Content-Type': 'application/json',
    }
  })
    .then(res => logger.log('File uploaded to S3 successfully', logger.MESSAGE_TYPE.LOG, true))
    .catch(CheckForError);
}

module.exports = uploadToS3;