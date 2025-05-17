import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as fs from 'fs';
import { RpcException } from '@nestjs/microservices';
@Injectable()
export class UploadService {
  constructor(@Inject('CLOUDINARY') private cloudService: typeof cloudinary) {}

  async uploadFile(
    file: any,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    try {
      const folderPath = './uploads';
      const filePath = `${folderPath}/${Date.now()}_${file.originalname}`;

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      fs.writeFileSync(filePath, Buffer.from(file.buffer.data, 'base64'));
      const isSuccess = await this.cloudService.uploader.upload(filePath, {
        resource_type: 'video',
      });
      if (!isSuccess) {
        throw new RpcException({
          message: 'Upload file failed',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      fs.rm(filePath, (err) => {
        if (err) {
          console.log('Xóa thất bại', err);
        }
      });

      return isSuccess;
    } catch (error) {
      throw new RpcException({
        message: 'Upload file failed',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  }
}
