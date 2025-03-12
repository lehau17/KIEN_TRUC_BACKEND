const amqp = require('amqplib');
require('dotenv').config()
async function createQueue() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    await channel.assertQueue('my_queue', { durable: true });
    console.log('Queue "my_queue" has been created');

    await channel.close();
    await connection.close();
}

createQueue();
