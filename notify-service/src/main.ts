import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://admin:1234@localhost:5672'],
        queue: 'mail_queue',
        queueOptions: {
          durable: true,
        },
        persistent: true,
      },
    },
  );
  await app.listen();
}
bootstrap();
