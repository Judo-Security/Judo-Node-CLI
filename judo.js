#!/usr/bin/env node

const parseArgs = require('minimist');

const configReader = require('./src/utils/configReader');
const instructions = require('./instructions');
const Create = require('./src/commands/create');
const Read = require('./src/commands/read');
const Expire = require('./src/commands/expire');
const Delete = require('./src/commands/delete');

const args = parseArgs(process.argv.slice(2), {
  string: ['c', 'r', 'input', 'inputfile', 'outputfile', 'ip', 'machine', 'local'],
  boolean: ['verbose']
});

const configArg = args.config;
const create = args.c;
const read = args.r;
const expire = args.expire;
const del = args.delete;
const local = args.local !== undefined ? true : false;

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
  if ((local && !outputFile) || !(input || inputFile) || !numberOfShards || !numberRequired) {
    if(local && !outputFile) console.log(instructions.outputFile);
    if (!input || !inputFile) console.log(instructions.inputFile);
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
    local
  });
}
else if (read) {
  // read judo file
  const verbose = args.verbose;
  Read({ storageKey, inputFile: read, verbose });
} else if (expire) {
  // Expire a secret immediately.
  Expire(storageKey, expire);
} else if (del) {
  // Attempt to delete a secret.
  Delete(storageKey, del);
} else {
  console.log(instructions.help);
}