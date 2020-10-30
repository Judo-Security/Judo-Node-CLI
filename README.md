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
This current version is setup to use `https://beta.judosecurity.com` service endpoints.

If you need to configure the client to use a different endpoint you can create your own `.json` config file and use it using the `--config="service.json"` flag when executing the Judo client. The content of the file should be a json object that looks like: `{"serviceUrl": "https://beta.judosecurity.com"}`

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

-c "secret name" 		Create judo file.

-r "input.judo" 		Read judo file.

-n <number> 			Number of shards.

-m <number> 			Number of shards required to make a quorum.

-e <minutes> 			Expiration in minutes. 0 = unlimited.
```

**On secret creation, the created Judo file would be displayed on the STDOUT itself which the user can then pipe to any shell script to either store Judo file on cloud or on your local file system.**

**On secret retrieval, the decrypted Judo file output would be displayed on the STDOUT which user can pipe to any file.**

<br>Here is a sample shell script demonstrating storage and retrieval of Judo File on AWS S3 bucket.


Store Judo file to AWS S3:
```
JUDOFILE=$1
BUCKETNAME=<your_aws_s3_bucketname>
FILENAME=$2
echo $JUDOFILE > $FILENAME
SENDTOS3=$(aws s3api put-object --bucket $BUCKETNAME --key $FILENAME --body $FILENAME)
rm $FILENAME
```

Judo command for creating a secret and piping the output to the above script

```
./script.sh "$(judo -c "name" --input="text_to_be_encrypted" -n5 -m3 -e0)" filename.judo
```

Retrieve Judo file from S3:
```
BUCKETNAME=<your_aws_s3-bucketname>
FILENAME=$1
SAVEFILEAS=$1
GETFROMS3=$(aws s3api get-object --bucket $BUCKETNAME --key $FILENAME $SAVEFILEAS)
more $FILENAME | node judo -r $FILENAME
rm $FILENAME
```

Command to be executed to retrieve a secret
```
./script.sh filename.judo
```

<br>Here is a sample shell script demonstrating storage and retrieval of Judo File on Azure Blob Storage Service.


Store Judo file to Azure blob container:
```
JUDOFILE=$1
ACCOUNTNAME=<your_azure_account_name>
ACCOUNTKEY=<your_azure_account_key>
CONTAINERNAME=<your_azure_blob_container>
FILENAME=$2
echo $JUDOFILE > $FILENAME
SENDTOBLOB=$(az storage blob upload --account-name $ACCOUNTNAME --account-key $ACCOUNTKEY --container-name $CONTAINERNAME --file $FILENAME --name $FILENAME)
rm $FILENAME
```

Judo command for creating a secret and piping the output to the above script

```
./script.sh "$(judo -c "secret_name" --input="text_to_be_encrypted" -n5 -m3 -e0)" filename.judo
```

Retrieve Judo file from Azure blob container:
```
ACCOUNTNAME=<your_azure_account_name>
ACCOUNTKEY=<your_azure_account_key>
CONTAINERNAME=<your_azure_blob_container>
FILENAME=$1
SAVEFILEAS=$1
GETFROMBLOB=$(az storage blob download --account-name $ACCOUNTNAME --account-key $ACCOUNTKEY --container-name $CONTAINERNAME --file $FILENAME --name $FILENAME)
more $FILENAME | node judo -r $FILENAME
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
