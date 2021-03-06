const logger = require('../utils/logger');
const judo = require('../judofile');
const deleteSecret = require('../services/deleteSecret');

function del(storageKey, inputFile) {
  const startTime = new Date();
  logger.log(`Reading Judo file: ${inputFile}`, logger.MESSAGE_TYPE.WARN, true);
  let judoFile = judo.readJudoFile(inputFile);
  if (!judoFile) {
    logger.log('There was a problem reading your judo file.', logger.MESSAGE_TYPE.ERROR);
    return;
  }

  // download the shards
  logger.log('Deleting secret.', logger.MESSAGE_TYPE.INFO);
  deleteSecret(judoFile.secretId, storageKey).then((results) => {
    // log the time taken
    const timeTaken = new Date() - startTime;
    logger.log(`Time taken: ${timeTaken}ms`, logger.MESSAGE_TYPE.INFO, true)
  }).catch(e => logger.log(e, logger.MESSAGE_TYPE.ERROR));
}

module.exports = del;