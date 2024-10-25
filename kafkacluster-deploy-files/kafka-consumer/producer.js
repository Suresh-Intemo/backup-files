const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',  
  brokers: ['localhost:9094'],
});

const topic = 'test-topic';

const runProducer = async () => {
  const producer = kafka.producer();

  await producer.connect();
  console.log('Producer connected');

  await producer.send({
    topic,
    messages: [{ value: JSON.stringify({ myKey: 'myValue' }) }],
  });

  console.log('Message sent to topic:', topic);
  await producer.disconnect();
};

const run = async () => {
    await runProducer();
};
    
run().catch(console.error);