import { Module } from '@nestjs/common';
import { JsonWebTokenService } from './jwt.service';

@Module({
  providers: [JsonWebTokenService],
  exports: [JsonWebTokenService],
})
export class JsonWebTokenModule {}
