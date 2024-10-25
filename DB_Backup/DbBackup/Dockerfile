FROM postgres:latest

RUN apt-get update && \
    apt-get install -y awscli curl

ENV AWS_ACCESS_KEY_ID=AKIA44QS533GA7Y34QLG
ENV AWS_SECRET_ACCESS_KEY=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
ENV AWS_DEFAULT_REGION=ap-south-1

# COPY .pgpass /root/.pgpass
COPY db-backup-script.sh /usr/local/bin/db-backup-script.sh

COPY . .

# RUN chmod 600 /root/.pgpass
RUN chmod +x /usr/local/bin/db-backup-script.sh

CMD ["/usr/local/bin/db-backup-script.sh"]
# CMD ["/bin/bash","-c","/usr/local/bin/backup-script.sh && sleep 6000"]
# /bin/bash -c '/usr/local/bin/backup-script.sh && sleep 300'