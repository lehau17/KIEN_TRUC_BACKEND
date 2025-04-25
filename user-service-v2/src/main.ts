import { GlobalExceptionFilter } from '@app/common/filter/exception.filter';
import { AccessTokenGuard } from '@app/common/guard/accessToken.guard';
import { BlackListGuard } from '@app/common/guard/blacklist.guard';
import { CheckRoleGuard } from '@app/common/guard/checkRole.guard';
import { PublicThrottlerGuard } from '@app/common/guard/public.rate_limiter.guard';
import { GlobalRateLimiter } from '@app/common/guard/rateLimiter.global';
import { GlobalInterceptor } from '@app/common/interceptor/Globa.interceptor';
import { RedisThrottlerStorageService } from '@app/common/redisThottle.service';
import { ExecutionContext, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const redisStore = new RedisThrottlerStorageService();
    const reflector = new Reflector();

    // use global guard
    app.useGlobalGuards(
        new GlobalRateLimiter(new ConfigService()),
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
            ['/api/auth/login', '/api/auth/register'],
        ),
        new AccessTokenGuard(
            new JwtService(),
            new ConfigService(),
            new Reflector(),
        ),
        new BlackListGuard(new Reflector()),
        new CheckRoleGuard(new Reflector(), new PrismaService()),
        // new RoleGuard(new Reflector()),
    );

    // use global interceptor
    app.useGlobalInterceptors(new GlobalInterceptor(new Reflector()));
    // use global filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // validation data global
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    const config = new DocumentBuilder()
        .setTitle('Employee API')
        .setDescription('API quản lý nhân viên')
        .setVersion('1.0')
        .addBearerAuth() // Thêm xác thực nếu cần
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);
    await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
