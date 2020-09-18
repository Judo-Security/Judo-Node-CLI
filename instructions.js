const help = '\n \
  Creating a new Judo file from an input string:\n \
  \tjudo -c "name" --outputfile="output.judo" --input="secret" -n5 -m3 -e0\n \
  \n \
  Creating a new Judo file from an input file:\n \
  \tjudo -c "name" --outputfile="output.judo" --inputfile="input.txt" -n5 -m3 -e0\n \
  \n \
  Reading a Judo file:\n \
  \tjudo -r "input.judo"\n \
  \n \
  Expire an existing Judo secret:\n \
  \tjudo --expire "input.judo"\n \
  \n \
  Delete an existing Judo secret:\n \
  \tjudo --delete "input.judo"\n \
  \n\n \
  Specify appropriate cloud storage service if you want to store file to cloud. \n \
  For example: \t\t For AWS S3, --cloud="aws s3" --bucket=<your_bucket_name> \n \
  \n\n \
  --config="client.json"\tThe location of the client config file.\n \
  --expire "input.judo"\tExpire a secret.\n \
  --delete "input.judo"\tDelete an expired secret.\n \
  --input="secret string"\tSecret string to be secured.\n \
  --inputfile=<filename>\tSecret file to be secured.\n \
  --ip="192.168.1.1"\t\tWhite list ip address. Note: to specify more than one IP, use the --ip switch more than once.\n \
  --machine="computer name"\t\tWhite list machine name. Note: to specify more than one machine name, use the --machine switch more than once.\n \
  --cloud="storage service name"\t\tName of the online blob storage service. Eg: aws s3, azure blob storage, google cloud storage\n \
  --outputfile=<filename>\tJudo file output.\n \
  --verbose\t\t\tDisplay verbose information. Mostly useful when used in conjunction with -r.\n \
  -c "secret name"\t\tCreate judo file.\n \
  -r "input.judo"\t\tRead judo file.\n \
  -n <number>\t\t\tNumber of shards.\n \
  -m <number>\t\t\tNumber of shards required to make a quorum.\n \
  -e <minutes>\t\t\tExpiration in minutes. 0 = unlimited.\n';

// const outputFile = 'Output file missing. Specify an output file by using --outputfile.';
const inputFile = 'Input missing. Specify an input by using --input or --inputfile.';
const numberOfShards = 'N missing. Specify the number of shards by using -n.';
const numberRequired = 'M missing. Specify the minimum number of shards by using -m.';
const specifyOutput = "Please specify the storage location of output file. Specify a cloud storage file by using --cloud or local storage by using --outputfile."

module.exports = {
  help,
  inputFile,
  numberOfShards,
  numberRequired,
  specifyOutput,
};