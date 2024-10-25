#!/bin/bash

# S3 Bucket and Prefix
bucket_name=$S3_BUCKET

# Log file path
log_file="s3_cleanup.log"

# echo $month_ago
# Function to log messages
log() {
    local timestamp=$(date +"%Y-%m-%d %T")
    echo [$timestamp] $1 >> $log_file
}

# Calculate timestamp for 1 month ago
month_ago=$(date -d "1 month ago" +"%Y-%m-%d")
echo "month-Value", $month_ago
log "The $month_ago before files"

# Ensure log file exists and is writable
# mkdir -p $log_folder
touch $log_file
chmod +x $log_file

# Log start of the script
log "Starting S3 cleanup script..."

# List objects in S3 bucket
objects=$(aws s3api list-objects --bucket $bucket_name --query "Contents[?LastModified<\`$month_ago\`].[Key]" --output text)

echo $objects
# Log the list of objects
log "List of objects in S3 bucket:"
log "$objects"

log objects older than 1 month
timestamp=$(date +"%Y-%m-%d %H:%M:%S")
{
    for obj in $objects; do
        log "Deleting $obj"
        aws s3api delete-object --bucket "$bucket_name" --key "$obj"
        if [ $? -eq 0 ]; then
            log "Deleted $obj successfully"
        else
            log "Failed to delete $obj"
        fi
    done
    webhook_url=$SLACK_WEBHOOK_URL
    channel=$CHANNEL
    username="Backup Clean Bot"
    text="$objects Clean successfully in S3 at $timestamp."

    curl -X POST -H 'Content-type: application/json' --data "{'channel':'$channel','username':'$username','text':'$text'}" $webhook_url

} || log "Error occurred during deletion process"

# Log completion of the script
log "S3 cleanup script completed."