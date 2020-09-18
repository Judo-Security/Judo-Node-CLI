#!/usr/bin/env node
const parseArgs = require('minimist');
const exec = require('child_process').exec;
const configReader = require('./src/utils/configReader');
const instructions = require('./instructions');
const Create = require('./src/commands/create');
const Read = require('./src/commands/read');
const Expire = require('./src/commands/expire');
const Delete = require('./src/commands/delete');
const fs = require('fs');
const { exit } = require('process');

if (!fs.existsSync('./.env')) {
  console.log('ENV file does not exist');
  console.log('Creating ENV File');
  execShellCommand('aws.sh').then(() => {
    console.log('ENV File now created');
    exit(0);
  });
}

function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

const args = parseArgs(process.argv.slice(2), {
  string: ['c', 'r', 'input', 'inputfile', 'outputfile', 'ip', 'machine', 'cloud', 'bucket'],
  boolean: ['verbose']
});

const configArg = args.config;
const create = args.c;
const read = args.r;
const expire = args.expire;
const del = args.delete;
const cloudStorage = args.cloud;
const bucketName = args.bucket;
const { storageKey, organizationId } = configReader(configArg);

if (create) {
  // create judo file
  const outputFile = args.outputfile;
  const input = args.input;
  const inputFile = args.inputfile;
  const numberOfShards = args.n;
  const numberRequired = args.m;
  const expiration = args.e || 0;
  const ipArgs = args.ip;
  const allowedIPs = ipArgs && ((typeof ipArgs === 'string') ? [ipArgs] : ipArgs) || [];
  const machineArgs = args.machine;
  const machineNames = machineArgs && ((typeof machineArgs === 'string') ? [machineArgs] : machineArgs) || [];

  const currentCloudStorages = new Set(["aws s3", "azure blob storage", "google cloud storage"]);

  const checkValidStorage = (cloudStorage && currentCloudStorages.has(cloudStorage) || outputFile) ? true : false;

  if (!checkValidStorage || !(input || inputFile) || !numberOfShards || !numberRequired) {
    if (!checkValidStorage) {
      console.log(instructions.specifyOutput);
    }
    if (!input && !inputFile) console.log(instructions.inputFile);
    if (!numberOfShards) console.log(instructions.numberOfShards);
    if (!numberRequired) console.log(instructions.numberRequired);
    console.log(instructions.help);
    return;
  }
  Create({
    storageKey,
    organizationId,
    secretName: create,
    outputFile,
    input,
    inputFile,
    numberOfShards,
    numberRequired,
    expiration,
    allowedIPs,
    machineNames,
    cloudStorage,
    bucketName
  });
}
else if (read) {
  // read judo file
  const verbose = args.verbose;
  Read({ storageKey, inputFile: read, cloudStorage, bucketName, verbose });
} else if (expire) {
  // Expire a secret immediately.
  Expire(storageKey, expire);
} else if (del) {
  // Attempt to delete a secret.
  Delete(storageKey, del);
} else {
  console.log(instructions.help);
}