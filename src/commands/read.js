const fs = require('fs');
const secrets = require('shamirs-secret-sharing');
const aes256 = require('../aes256gcm');
const logger = require('../utils/logger');
const judo = require('../judofile');
const getShards = require('../services/getShards');

function readOutputFile(secretType, outputFile, save) {
  return new Promise((resolve, reject) => {
    const path = save ? save + '/' + outputFile : outputFile;
    if (secretType === 2 && outputFile && outputFile.length > 0) {
      return fs.access(path, fs.constants.F_OK, (err) => {
        if (err) {
          // file doesn't exist
          resolve();
        } else {
          if (save) {
            resolve();
          } else {
            reject('File cannot be displayed on STDOUT. Specify location to save the Judo file.');
          }
        }
      });
    } else {
      resolve();
    }
  });
}
function read({ storageKey, inputFile, save, verbose }) {
  const startTime = new Date();
  logger.log(`Reading Judo file: ${inputFile}`, logger.MESSAGE_TYPE.WARN, verbose);

  // read the JUDO file
  let judoFile = judo.readJudoFile(inputFile);
  if (!judoFile) {
    logger.log('There was a problem reading your judo file.', logger.MESSAGE_TYPE.ERROR, verbose);
    return;
  }

  const outputFile = judoFile.filename;
  const secretType = judoFile.type;
  // if we have an outputfile defined, let's see if it already exists.
  readOutputFile(secretType, outputFile, save).then(() => {
    // download the shards
    logger.log('Downloading shards.', logger.MESSAGE_TYPE.INFO, verbose);
    getShards(judoFile.secretId, judoFile.shardUrls, storageKey).then((results) => {
      logger.log(`Got ${results.length} shards out of ${judoFile.shardUrls.length}`, logger.MESSAGE_TYPE.INFO, verbose);
      try {
        // Recombine the shards to create the kek
        const combinedShares = secrets.combine(results);
        const combinedSharesStr = combinedShares.toString();
        // decrypt the dek uysing the recombined kek
        const decryptedDek = aes256.decrypt(Buffer.from(combinedSharesStr, 'base64'), judoFile.wrappedKey);
        // decrypt the data using the dek
        const decryptedData = aes256.decrypt(Buffer.from(decryptedDek, 'base64'), judoFile.data);
        const decryptedText = Buffer.from(decryptedData, 'base64');

        if (secretType === 2 && outputFile && outputFile.length > 0) {
          const path = save ? save + '/' + outputFile : outputFile;
          // write file
          fs.writeFile(path, decryptedText, function (err) {
            if (err) {
              logger.log(err.message, logger.MESSAGE_TYPE.ERROR, verbose);
            }
            logger.log(`Output written to: ${path}`, logger.MESSAGE_TYPE.LOG, verbose);
          });
        } else {
          // log the decrypted text
          logger.log(decryptedText.toString('utf8'), logger.MESSAGE_TYPE.INFO, true);
        }
        // log the time taken
        const timeTaken = new Date() - startTime;
        logger.log(`Time taken: ${timeTaken}ms`, logger.MESSAGE_TYPE.INFO, verbose)
      } catch {
        logger.log('There was a problem decrypting the secret.\nThe secret could not longer exist, has expired, or is not accessible by this computer.', logger.MESSAGE_TYPE.ERROR, verbose);
      }
    }).catch(e => logger.log(e, logger.MESSAGE_TYPE.ERROR));
  }).catch(e => logger.log(e, logger.MESSAGE_TYPE.ERROR));
}

module.exports = read;