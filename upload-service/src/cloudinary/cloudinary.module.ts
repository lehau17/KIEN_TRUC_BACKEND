import { Module } from '@nestjs/common';
import { CloudinaryProvider } from 'src/common/provider/cloudinary.provider';

@Module({
  providers: [CloudinaryProvider],
  exports: ['CLOUDINARY'],
})
export class CloudinaryModule {}
