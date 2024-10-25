# # Use Alpine Linux as a base image
# FROM alpine:latest

# # Install AWS CLI
# RUN apk --no-cache add bash aws-cli curl

# ENV AWS_ACCESS_KEY_ID=AKIA44QS533GA7Y34QLG
# ENV AWS_SECRET_ACCESS_KEY=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
# ENV AWS_DEFAULT_REGION=ap-south-1

# # Copy the script file into the container
# COPY auto-clean-s3.sh /usr/local/bin/auto-clean-s3.sh

# COPY . .

# # Set the script file as executable
# RUN chmod +x /usr/local/bin/auto-clean-s3.sh

# # Run the script when the container launches
# # CMD ["/usr/local/bin/auto-clean-s3.sh"]
# CMD ["/bin/sh","-c","/usr/local/bin/auto-clean-s3.sh"]
# Use an official Python runtime as a parent image
FROM python:3.9

# Install AWS CLI
RUN pip install awscli

# Install curl
RUN apt-get update && apt-get install -y curl

# Set the working directory in the container
WORKDIR /usr/src/app

ENV AWS_ACCESS_KEY_ID=AKIA44QS533GA7Y34QLG
ENV AWS_SECRET_ACCESS_KEY=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
ENV AWS_DEFAULT_REGION=ap-south-1

# Copy the script into the container
COPY auto-clean-s3.sh .

COPY . .

# Make the script executable
RUN chmod +x auto-clean-s3.sh

# Command to run the script
CMD ["./auto-clean-s3.sh"]
