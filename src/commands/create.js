const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const secrets = require('shamirs-secret-sharing');
const aes256 = require('../aes256gcm');
const logger = require('../utils/logger');
const judo = require('../judofile');
const reserveSecret = require('../services/reserveSecret');
const fillShards = require('../services/fillShardsService');
const fulfillSecret = require('../services/fulfillSecret');

const ipAddressValidation = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

function create({storageKey, organizationId, secretName, outputFile, input, inputFile, numberOfShards, numberRequired, expiration, allowedIPs, machineNames}) {
  const startTime = new Date();

  // validate IPs
  let allIPsAreValid = true;
  for (let i = 0; i < allowedIPs.length; i++) {
    const ip = allowedIPs[i].toString();
    const valid = ipAddressValidation.test(ip);
    if (!valid) {
      logger.log(`${ip} is not a valid IP Address.`, logger.MESSAGE_TYPE.ERROR, true);
      allIPsAreValid = false;
    }
  }
  if (!allIPsAreValid) return;

  logger.log(`Creating Judo file: ${outputFile}`, logger.MESSAGE_TYPE.WARN, true);

  const secretInputFilename = (inputFile && inputFile.length > 0) ? inputFile : null;
  const secretType = (inputFile && inputFile.length > 0) ? 2 : 1;

  // read file
  let secret = input;
  let secretFilename = '';
  if (secretInputFilename) {
    try {
      const fileData = fs.readFileSync(inputFile);
      const data = Buffer.from(fileData, 'base64');
      secretFilename = path.basename(secretInputFilename);
      secret = data;
    } catch (err) {
      logger.log(err.message, logger.MESSAGE_TYPE.ERROR, true);
      return;
    }
  }

  // create dek and encrypt the data
  const dek = crypto.randomBytes(32);
  const encryptedDataObj = aes256.encrypt(dek, secret);
  // create kek and encrypt the dek
  const kek = crypto.randomBytes(32);
  const encrypedDekObj = aes256.encrypt(kek, dek);
  // split apart the kek using shamirs
  const kekHex = kek.toString('base64');
  const shares = secrets.split(kekHex, { shares: numberOfShards, threshold: numberRequired });
  const stringShares = shares.map(share => share.toString('hex'));

  logger.log('Creating a new secret.', logger.MESSAGE_TYPE.WARN, true);
  reserveSecret(secretName, numberOfShards, expiration, allowedIPs, machineNames, organizationId, storageKey).then((response) => {
    logger.log(`(${numberOfShards}) secret shards have been reserved.`, logger.MESSAGE_TYPE.INFO, true);
    fillShards(response.secretId, response.urls, stringShares, storageKey).then(() => {
      logger.log(`(${numberOfShards}) secret shards have been uploaded.`, logger.MESSAGE_TYPE.INFO, true);
      fulfillSecret(response.secretId, storageKey).then(() => {
        logger.log('Success. Secret has been created.', logger.MESSAGE_TYPE.INFO, true);
        let judoFile = new judo.JudoFile({
          version:1,
          type:secretType,
          filename:secretFilename,
          name:secretName,
          secret_id:response.secretId,
          index:response.urls,
          n:numberOfShards,
          m:numberRequired,
          wrapped_key:encrypedDekObj,
          data:encryptedDataObj
        });
        if (judoFile) {
            judoFile.write(outputFile);
        }
        // Log the time taken
        const timeTaken = new Date() - startTime;
        logger.log(`Time taken: ${timeTaken}ms`, logger.MESSAGE_TYPE.INFO, true)
      }).catch(e => logger.log(e, logger.MESSAGE_TYPE.ERROR, true));
    }).catch(e => logger.log(e, logger.MESSAGE_TYPE.ERROR, true));
  }).catch(e => logger.log(e, logger.MESSAGE_TYPE.ERROR, true));
}

module.exports = create;