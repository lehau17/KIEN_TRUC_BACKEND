import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger: Logger = new Logger(PrismaService.name);
  onModuleDestroy() {
    this.$disconnect();
  }
  onModuleInit() {
    this.$connect();
    this.logger.debug('Connected to PrismaService');
  }
}
