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

--ip="192.168.1.1" 		White list ip address. Note: to specify more than one IP, use the --ip switch more than once. For range of IP's use CIDR block.

--ipdeny="192.168.1.1" 		Black list ip address. Note: to specify more than one IP, use the --ipdeny switch more than once. For range of IP's use CIDR block.

--machine="computer name" 	White list machine name. Note: to specify more than one machine name, use the --machine switch more than once.

--save="/home"			Location where to save the decrypted Judo file

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

### Judo File Management
#### AWS S3
Here is a sample shell script demonstrating storage and retrieval of Judo File on AWS S3 bucket.


##### Store Judo file to AWS S3:
```
SECRETNAME=$1
FILETYPE=$2
FILETOENCRYPT="$3"
SHARDS=$4
THRESHOLD=$5
EXPIRY=$6
FILENAME=$7

if [[ $FILETYPE == "file" ]]; then
  judofile=$(judo -c $1 --inputfile="$FILETOENCRYPT" -n$SHARDS -m$THRESHOLD -e$EXPIRY --machine=<machine_name>)
  else
  judofile=$(judo -c $1 --input="$FILETOENCRYPT" -n$SHARDS -m$THRESHOLD -e$EXPIRY)
fi

BUCKETNAME=<your_aws_s3_bucketname>

echo $judofile | jq '.' > $FILENAME

URL=$(aws s3api put-object --bucket $BUCKETNAME --key $FILENAME --body $FILENAME)

rm $FILENAME
```

Judo command for creating a secret and piping the output to the above script

To create secret of Text type:
```
./script.sh "<secret_name>" text <secret_text_to_be_encrypted> <number_of_shards> <minimum_shards> <expiry> filename.judo

./script.sh Bob text XQc123 5 3 0 bob.judo
```
To create secret of File type:
```
./script.sh "<secret_name>" file <file_path> <number_of_shards> <minimum_shards> <expiry> filename.judo

./script.sh Bob file "/mnt/c/Users/Bob/file.pdf" 5 3 0 bob.judo
```

##### Retrieve Judo file from S3:
```
BUCKETNAME=<your_aws_s3_bucketname>
FILENAME=$1
SAVEFILEAS=$FILENAME
SAVETO="$2"
GETFROMS3=$(aws s3api get-object --bucket $BUCKETNAME --key $FILENAME $SAVEFILEAS)
more $FILENAME | judo -r $FILENAME --save="$2"
rm $FILENAME
```

Command to be executed to retrieve a secret:

To retrieve secret of Text type:
```
./script.sh filename.judo
```

To retrieve secret of File type:
```
./script.sh filename.judo <path_to_save_decrypted_secret>
./script.sh filename.judo "/mnt/c/Users"
```

#### Azure Blob Storage
Here is a sample shell script demonstrating storage and retrieval of Judo File on Azure Blob Storage Service.

##### Store Judo file to Azure blob container:
```
SECRETNAME=$1
FILETYPE=$2
FILETOENCRYPT="$3"
SHARDS=$4
THRESHOLD=$5
EXPIRY=$6
FILENAME=$7

if [[ $FILETYPE == "file" ]]; then
  judofile=$(judo -c $1 --inputfile="$FILETOENCRYPT" -n$SHARDS -m$THRESHOLD -e$EXPIRY --machine=<machine_name>)
  else
  judofile=$(judo -c $1 --input="$FILETOENCRYPT" -n$SHARDS -m$THRESHOLD -e$EXPIRY)
fi

ACCOUNTNAME=<account_name>
ACCOUTKEY=<account_key>
CONTAINERNAME=<container_name>


echo $judofile | jq '.' > $FILENAME

URL=$(az storage blob upload --account-name $ACCOUNTNAME --account-key $ACCOUTKEY --container-name $CONTAINERNAME --file $FILENAME --name $FILENAME)

rm $FILENAME
```

Judo command for creating a secret and piping the output to the above script:

To create secret of Text type:
```
./script.sh "<secret_name>" text <secret_text_to_be_encrypted> <number_of_shards> <minimum_shards> <expiry> filename.judo

./script.sh Bob text XQc123 5 3 0 bob.judo
```
To create secret of File type:
```
./script.sh "<secret_name>" file <file_path> <number_of_shards> <minimum_shards> <expiry> filename.judo

./script.sh Bob file "/mnt/c/Users/Bob/file.pdf" 5 3 0 bob.judo
```


##### Retrieve Judo file from Azure blob container:
```
ACCOUNTNAME=<account_name>
ACCOUTKEY=<account_key>
CONTAINERNAME=<container_name>

FILENAME=$1
SAVEFILEAS=$FILENAME
SAVETO="$2"
GETFROMBLOB=$(az storage blob download --account-name $ACCOUNTNAME --account-key $ACCOUNTKEY --container-name $CONTAINERNAME --file $FILENAME --name $FILENAME)
more $FILENAME | judo -r $FILENAME --save="$2"
rm $FILENAME
```

Command to be executed to retrieve a secret:

Text type:
```
./script.sh filename.judo
```

File type:
```
./script.sh filename.judo <path_to_save_decrypted_secret>
./script.sh filename.judo "/mnt/c/Users"
```

#### Google Cloud Platform

Here is a sample shell script demonstrating storage and retrieval of Judo File on Google Cloud Platform.


##### Store Judo file to Google Cloud Platform:
```
SECRETNAME=$1
FILETYPE=$2
FILETOENCRYPT="$3"
SHARDS=$4
THRESHOLD=$5
EXPIRY=$6
FILENAME=$7

if [[ $FILETYPE == "file" ]]; then
  judofile=$(judo -c $1 --inputfile="$FILETOENCRYPT" -n$SHARDS -m$THRESHOLD -e$EXPIRY --machine=<machine_name>)
  else
  judofile=$(judo -c $1 --input="$FILETOENCRYPT" -n$SHARDS -m$THRESHOLD -e$EXPIRY)
fi

BUCKETNAME=<bucket_name_of_storage_account>

echo $judofile | jq '.' > $FILENAME
SENDTOGCP=$(gsutil cp $FILENAME gs://$BUCKETNAME/)
rm $FILENAME
```

Judo command for creating a secret and piping the output to the above script:

To create secret of Text type:
```
./script.sh "<secret_name>" text <secret_text_to_be_encrypted> <number_of_shards> <minimum_shards> <expiry> filename.judo

./script.sh Bob text XQc123 5 3 0 bob.judo
```
To create secret of File type:
```
./script.sh "<secret_name>" file <file_path> <number_of_shards> <minimum_shards> <expiry> filename.judo

./script.sh Bob file "/mnt/c/Users/Bob/file.pdf" 5 3 0 bob.judo
```

##### Retrieve Judo file from Google Cloud Platform:
```
BUCKETNAME=<bucket_name_of_storage_account>
FILENAME="$1"
SAVETO="$2"
GETFROMGCP=$(gsutil cp gs://$BUCKETNAME/$FILENAME $FILENAME)
more $FILENAME | judo -r $FILENAME --save="$2"
rm $FILENAME
```

Command to be executed to retrieve a secret:

Text type:
```
./script.sh filename.judo
```

File type:
```
./script.sh filename.judo <path_to_save_decrypted_secret>
./script.sh filename.judo "/mnt/c/Users"
```

### Client removal
```
npm uninstall -g @judosecurity/judo-node-client
```

### Logging
By default the Judo client will log non-sensitive information to the `judo.log` file.
