const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',  
  brokers: ['localhost:9094']
});

const topic = 'test-topic';

const runProducer = async () => {
  const producer = kafka.producer();

  await producer.connect();
  console.log('Producer connected');

  await producer.send({
    topic,
    messages: [{ value: 'Hello Kafka!' }],
  });

  console.log('Message sent to topic:', topic);
  await producer.disconnect();
};

const runConsumer = async () => {
  const consumer = kafka.consumer({ groupId: 'test-group' });

  await consumer.connect();
  console.log('Consumer connected');

  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value.toString(),
      });
    },
  });
};

const run = async () => {

//   await runProducer();
  await runConsumer();
};

run().catch(console.error);
