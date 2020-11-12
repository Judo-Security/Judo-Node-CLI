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
const constants = require('../utils/constants');
const { IPAddress } = require('@judosecurity/judo-client-library');

const ipAddressValidation = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

function create({ storageKey, organizationId, secretName, input, inputFile, numberOfShards, numberRequired, expiration, allowedIPs, deniedIPs, machineNames, region, verbose }) {
  const startTime = new Date();

  // validate IPs
  let allIPsAreValid = true;
  function isValidIP(arrayOfIPs) {
    for (let i = 0; i < arrayOfIPs.length; i++) {
      const checkIP = new IPAddress(arrayOfIPs[i]);
      if (!checkIP.isValidIPAddress()) {
        logger.log(`${checkIP.getIPAddress()} is not a valid IP Address.`, logger.MESSAGE_TYPE.ERROR, true);
        allIPsAreValid = false;
      }
    }
  }

  if (allowedIPs) {
    isValidIP(allowedIPs);
  }

  if (deniedIPs) {
    isValidIP(deniedIPs);
  }

  if (!allIPsAreValid) return;
  logger.log(`Creating Judo file`, logger.MESSAGE_TYPE.WARN, verbose);

  const secretInputFilename = (inputFile && inputFile.length > 0) ? inputFile : null;
  const secretType = (inputFile && inputFile.length > 0) ? constants.SECRETTYPE.FILE : constants.SECRETTYPE.TEXT;

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

  logger.log('Creating a new secret.', logger.MESSAGE_TYPE.WARN, verbose);
  reserveSecret(secretName, numberOfShards, expiration, allowedIPs, deniedIPs, machineNames, region, organizationId, storageKey).then((response) => {
    logger.log(`(${numberOfShards}) secret shards have been reserved.`, logger.MESSAGE_TYPE.INFO, verbose);

    fillShards(response.secretId, response.urls, stringShares, storageKey).then(() => {
      logger.log(`(${numberOfShards}) secret shards have been uploaded.`, logger.MESSAGE_TYPE.INFO, verbose);

      fulfillSecret(response.secretId, storageKey).then(() => {
        logger.log('Success. Secret has been created.', logger.MESSAGE_TYPE.INFO, verbose);

        // Create a JSON Object with all the information
        const jsonObject = {
          created: new Date().toLocaleString(),
          version: 1,
          type: secretType,
          filename: secretFilename,
          name: secretName,
          secret_id: response.secretId,
          index: response.urls,
          n: numberOfShards,
          m: numberRequired,
          wrapped_key: encrypedDekObj,
          data: encryptedDataObj
        };
        // Create JudoFile of JSON Object
        let judoFile = new judo.JudoFile(jsonObject);
        // Check if judoFile is valid with all the necessary fields
        if (judoFile) {
          // If the judoFile is valid, print it to console
          logger.log(JSON.stringify(jsonObject, null, 4), logger.MESSAGE_TYPE.INFO, true);
        }

        // Log the time taken
        const timeTaken = new Date() - startTime;
        logger.log(`Time taken: ${timeTaken}ms`, logger.MESSAGE_TYPE.INFO, verbose)
      }).catch(e => logger.log(e, logger.MESSAGE_TYPE.ERROR, true));
    }).catch(e => logger.log(e, logger.MESSAGE_TYPE.ERROR, true));
  }).catch(e => logger.log(e, logger.MESSAGE_TYPE.ERROR, true));
}

module.exports = create;