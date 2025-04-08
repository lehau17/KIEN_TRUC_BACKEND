import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExecutionContext, ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import { HttpExceptionFilter } from './common/filters/HttpException';
import { TransformInterceptor } from './common/interceptors/handler_response';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RedisThrottlerStorageService } from './RedisThrottlerStorage/throttler-redis.service';
import { GlobalThrottlerGuard } from './common/guards/global.rate_limit.guard';
import { PublicThrottlerGuard } from './common/guards/public.rate_limiter.guard';
import { AccessTokenGuard } from './common/guards/accessToken.guard';
import { PrivateThrottlerGuard } from './common/guards/private.rate_limiter.guard';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { BlackListGuard } from './common/guards/blacklist.guard';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  //logger
  const logger = WinstonModule.createLogger({
    defaultMeta: { service: 'API Gateway' },
    transports: [
      new winston.transports.Http({
        host: 'localhost', // Tên container Logstash hoặc IP của Logstash
        port: 5044, // Cổng kết nối với Logstash
        level: 'info',
      }),
      new winston.transports.Console(),
    ],
  });
  //
  const app = await NestFactory.create(AppModule, { logger });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Chuyển đổi dữ liệu vào DTO
      whitelist: true, // Loại bỏ các thuộc tính không được định nghĩa trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu có thuộc tính không hợp lệ
    }),
  );
  app.enableCors();
  const redisStore = new RedisThrottlerStorageService();
  const reflector = new Reflector();

  app.useGlobalGuards(
    new GlobalThrottlerGuard(
      {
        throttlers: [
          {
            limit: Number(process.env.RATE_LIMIT_GLOBAL),
            ttl: 60,
            name: 'rate-limit:global',
            getTracker: (req: Record<string, any>, context: ExecutionContext) =>
              'rate-limit:global',
          },
        ],
      },
      redisStore,
      reflector,
    ),
    new PublicThrottlerGuard(
      {
        throttlers: [
          {
            limit: Number(process.env.RATE_LIMIT_PUBLIC),
            ttl: 60,
            name: 'rate-limit:public',
            getTracker: (req: Record<string, any>, context: ExecutionContext) =>
              'rate-limit:public',
          },
        ],
      },
      redisStore,
      reflector,
      ['/auth/login', '/auth/register'],
    ),
    new AccessTokenGuard(reflector),
    new PrivateThrottlerGuard(
      {
        throttlers: [
          {
            limit: Number(process.env.RATE_LIMIT_PRIVATE),
            ttl: 60,
            name: 'rate-limit:public',
            getTracker: (req: Record<string, any>, context: ExecutionContext) =>
              'rate-limit:public',
          },
        ],
      },
      redisStore,
      reflector,
    ),
    new BlackListGuard(new ConfigService()),
  );

  const swagger = new DocumentBuilder()
    .setTitle('Spotify API Documentation')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'token',
      },
      'access_token',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('swagger', app, document);
  app.use(helmet(), compression());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    // new GlobalRateLimitInterceptor(
    //   new ConfigService(),
    //   new RedisThrottlerStorageService(),
    // ),
    new TransformInterceptor(new Reflector()),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
