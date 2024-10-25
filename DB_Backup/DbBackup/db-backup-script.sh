#!/bin/bash

# Variables
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
# TIMESTAMP=$(date +"%Y%m%d")
BACKUP_DIR="/tmp"  # Temporary directory to store the backup file
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
S3_BUCKET=$S3_BUCKET
AWS_REGION=$AWS_REGION
CONTENT=$CONTENT
LOG_FILE="$BACKUP_DIR/backup.log"
echo "creating backup..."

timestamp=$(date +"%Y-%m-%d %H:%M:%S")

# Dump the database
echo "Password" $DB_PASSWORD,"User" $DB_USER,"Host" $DB_HOST,"DBName" $DB_NAME,"Backup file" $BACKUP_DIR/$DB_NAME-$TIMESTAMP.dump

{
    echo "Testing the connection.."
    PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -d $DB_NAME -p $DB_PORT -c "SELECT 1;"  2>&1
    if [ $? -eq 0 ]; then
        echo "Testing Done"
    else
        echo "Testing Error"
    fi
}
export PGPASSWORD=$DB_PASSWORD
{
  echo "Dumping database..."
  pg_dump -U $DB_USER -Fc -h $DB_HOST -d $DB_NAME -p $DB_PORT > $BACKUP_DIR/$DB_NAME-$TIMESTAMP.dump 2>&1
  if [ $? -eq 0 ]; then
    webhook_url=$SLACK_WEBHOOK_URL
    channel=$CHANNEL
    username="Backup Bot"
    text="$CONTENT DB Backup completed successfully at $timestamp."

    curl -X POST -H 'Content-type: application/json' --data "{'channel':'$channel','username':'$username','text':'$text'}" $webhook_url

    echo "Backup completed successfully."
  else
    echo "Backup failed. Check the logs for details."
  fi
}

# PGPASSWORD=$DB_PASSWORD pg_dump -U $DB_USER -Fc -h $DB_HOST -d $DB_NAME -p $DB_PORT > $BACKUP_DIR/$DB_NAME-$TIMESTAMP.dump
# pg_dump -U $DB_USER -Fc -h $DB_HOST -d $DB_NAME -p $DB_PORT > $BACKUP_DIR/$DB_NAME-$TIMESTAMP.dump

echo "done"
echo "Upload the backup file to S3"
aws s3 cp $BACKUP_DIR/$DB_NAME-$TIMESTAMP.dump s3://$S3_BUCKET/$DB_NAME-$TIMESTAMP.dump --region $AWS_REGION 2>&1
{
  if [ $? -eq 0 ]; then
    webhook_url=$SLACK_WEBHOOK_URL
    channel=$CHANNEL
    username="Backup Bot"
    text="$CONTENT DB S3 Upload successfully at $timestamp."

    curl -X POST -H 'Content-type: application/json' --data "{'channel':'$channel','username':'$username','text':'$text'}" $webhook_url
    echo "S3 Upload successfully."
  else
    echo "Failed to upload in S3"
  fi
}
unset PGPASSWORD
rm $BACKUP_DIR/$DB_NAME-$TIMESTAMP.dump