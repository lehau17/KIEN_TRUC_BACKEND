const amqp = require('amqplib');

async function createQueue() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    await channel.assertQueue('my_queue', { durable: true });
    console.log('Queue "my_queue" has been created');

    await channel.close();
    await connection.close();
}

createQueue();
