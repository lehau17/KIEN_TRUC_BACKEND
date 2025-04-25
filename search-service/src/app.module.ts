import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ElasticModule } from './elastic/elastic.module';
import { ConfigModule } from '@nestjs/config';
import SearchController from './elastic/elastic.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ElasticModule],
  controllers: [AppController, SearchController],
  providers: [AppService],
})
export class AppModule {}
