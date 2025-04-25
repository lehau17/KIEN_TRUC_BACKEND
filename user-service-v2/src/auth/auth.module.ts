import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EmployeeService } from 'src/employee/employee.service';
import { JsonWebTokenService } from 'src/jwt/jwt.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleService } from 'src/role/role.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'MATH_SERVICE',
                imports: [ConfigModule], // Import ConfigModule để lấy config từ env
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://admin:1234@localhost:5672'],
                        queue: configService.get<string>('RABBITMQ_QUEUE') || 'mail_queue',
                        queueOptions: {
                            durable: true
                        },
                        persistent: true
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],

    controllers: [AuthController],
    providers: [
        AuthService,
        EmployeeService,
        PrismaService,
        JsonWebTokenService,
        RoleService,
    ],
})
export class AuthModule { }
