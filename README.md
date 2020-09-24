# Judo Node Client

### Requirements
Node is required to be installed to run the client tool.

You can download NodeJS at the official [NodeJS website](https://nodejs.org).

After you install it you can check that you have node installed by issuing the command:

```
node -v
```

### Client Installation
Use NPM to install the judo client globally.
```
npm install -g @judosecurity/judo-node-client
```

### Client Setup
- Login to the judo website.
- Goto your user profile.
- Download your client configuration and copy the client.json into the CLI directory.

### Client Connection Setup
This current version is setup to use `https://staging.judosecurity.com` service endpoints.

If you need to configure the client to use a different endpoint you can either
- Edit the `services.json` file located in your judo-node-client NPM installation location.
*or*
- Create your own `.json` config file and use it using the `--config="client.json"` flag when executing the Judo client. The content of the file should be a json object that looks like: `{"serviceUrl": "https://staging.judosecurity.com"}`

### Usage
You can issue the command `judo` to see how to use the client. Here is an overview:
```
Creating a new Judo file from an input string:
	judo -c "name" --input="secret" -n5 -m3 -e0

Creating a new Judo file from an input file:
	judo -c "name" --inputfile="input.txt" -n5 -m3 -e0

Reading a Judo file:
	judo -r "input.judo"

Expire an existing Judo secret:
	judo --expire "input.judo"

Delete an existing Judo secret:
	judo --delete "input.judo"

--config="client.json" 		The location of the client config file.

--expire "input.judo" 		Expire a secret.

--delete "input.judo" 		Delete an expired secret.

--input="secret string" 	Secret string to be secured.

--inputfile=<filename> 		Secret file to be secured.

--ip="192.168.1.1" 		White list ip address. Note: to specify more than one IP, use the --ip switch more than once.

--machine="computer name" 	White list machine name. Note: to specify more than one machine name, use the --machine switch more than once.

--verbose 			Display verbose information. Mostly useful when used in conjunction with -r.

--save                   	Location where to save the decrypted Judo File.

-c "secret name" 		Create judo file.

-r "input.judo" 		Read judo file.

-n <number> 			Number of shards.

-m <number> 			Number of shards required to make a quorum.

-e <minutes> 			Expiration in minutes. 0 = unlimited.
```

**On secret creation, the created Judo file would be displayed on the STDOUT itself which the user can then pipe to any shell script to either store Judo file on cloud or on your local file system.**

**On secret retrieval, the decrypted Judo file output would be displayed on the STDOUT which user can pipe to any file.**

Here is a sample shell script demonstrating storage and retrieval of Judo File on AWS S3 bucket.


Store Judo file to AWS S3:
```
SECRETNAME=$1
FILETYPE=$2
FILETOENCRYPT="$3"
SHARDS=$4
THRESHOLD=$5
EXPIRY=$6
FILENAME=$7

if [[ $FILETYPE == "file" ]]; then
  judofile=$(node judo -c $1 --inputfile="$FILETOENCRYPT" -n$SHARDS -m$THRESHOLD -e$EXPIRY)
  else
  judofile=$(node judo -c $1 --input="$FILETOENCRYPT" -n$SHARDS -m$THRESHOLD -e$EXPIRY)
fi

BUCKETNAME='ajmera-infotech'

echo $judofile > $FILENAME

URL=$(aws s3api put-object --bucket $BUCKETNAME --key $FILENAME --body $FILENAME)

rm $FILENAME
```

Judo command for creating a secret and piping the output to the above script

```
./create.sh <SECRETNAME> <FILE_TYPE> <CONTENT_TO_BE_ENCODED> <NUMBER_OF_SHARDS> <THRESHOLD_SHARDS> <EXPIRY> filename.judo
```

Retrieve Judo file from S3:
```
BUCKETNAME='ajmera-infotech'
FILENAME=$1
SAVEFILEAS=$FILENAME
SAVETO="$2"

GETFILE=$(aws s3api get-object --bucket $BUCKETNAME --key $FILENAME $SAVEFILEAS)

more $FILENAME | node judo -r $FILENAME --save="$2"

rm $FILENAME
```

Command to be executed to retrieve a secret
```
./script.sh filename.judo
```
### Client removal
```
npm uninstall -g @judosecurity/judo-node-client
```

### Logging
By default the Judo client will log non-sensitive information to the `judo.log` file.
