const fs = require('fs');
const logger = require('./utils/logger');

class JudoFile {
  constructor({ version, type, filename = '', name, secret_id, index, n, m, wrapped_key, data }) {
    this.version = version;         // Judo file version number
    this.type = type;               // Input type: 1=text 2=file
    this.filename = filename;       // Input filename (if needed)
    this.name = name;               // Secret name
    this.secretId = secret_id;      // Secret Id
    this.shardUrls = index;         // Shard URLs
    this.n = n;                     // The number of shards created for this secret
    this.m = m;                     // The minimum number of shard required to recreate this secret
    this.wrappedKey = wrapped_key;  // key key
    this.data = data;               // encrypted data

    const error = this.validateSelf();
    if (error) {
      throw new Error(error);
    }
  }

  validateSelf() {
    var errors = [];
    // check for object types
    if (typeof this.version != 'number') errors.push('Version should be a number.');
    if (typeof this.type != 'number') errors.push('Type should be a number.');
    if (typeof this.name != 'string') errors.push('Name should be a string.');
    if (typeof this.secretId != 'string') errors.push('Secret Id should be a string.');
    if (Array.isArray(this.shardUrls) === false) errors.push('ShardUrls should be an array.');
    if (typeof this.n != 'number') errors.push('N should be a number.');
    if (typeof this.m != 'number') errors.push('M should be a number.');
    if (typeof this.wrappedKey != 'string') errors.push('Wrapped Key should be a string.');
    if (typeof this.data != 'string' || !this.data) errors.push('Data should be a string.');

    // check for whole numbers
    if (Number.isInteger(this.n) === false) errors.push('N should be a whole number.');
    if (Number.isInteger(this.m) === false) errors.push('M should be a whole number.');

    // check for value ranges
    if (this.m > this.n) errors.push('The number of required shards (-M) should be less then the total number of shards (-N).');
    if (this.n <= 2) errors.push('You must specify 3 or more shards (-N).');
    if (this.m <= 2) errors.push('You must specify 3 or more shards (-M).');
    if (this.n > 100) errors.push('You can only create up to 100 shards.');

    if (errors.length > 0) {
      return errors.join(', ');
    }
    return null;
  }

  write(filename) {
    if (filename) {
      const jsonObject = {
        created: new Date().toLocaleString(),
        version: this.version,
        type: this.type,
        filename: this.filename,
        name: this.name,
        secret_id: this.secretId,
        index: this.shardUrls,
        n: this.n,
        m: this.m,
        wrapped_key: this.wrappedKey,
        data: this.data,
      };
      fs.writeFile(filename, JSON.stringify(jsonObject, null, 4), function (err) {
        if (err) {
          logger.log(err.message, logger.MESSAGE_TYPE.ERROR, true);
        }

        // logger.log(`Judo file has been saved to ${filename}.`, logger.MESSAGE_TYPE.INFO, true);
      });
    }
  }
}

function readJudoFile(filename) {
  if (filename) {
    try {
      const fileData = fs.readFileSync(filename);
      const data = JSON.parse(Buffer.from(fileData, 'base64').toString('utf8'));
      const judoFile = new JudoFile(data);
      return judoFile;
    } catch (err) {
      logger.log(err.message, logger.MESSAGE_TYPE.ERROR, true);
    }
  }
  return null;
}

module.exports = {
  JudoFile,
  readJudoFile
};
