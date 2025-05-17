import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
    BadRequestException,
    Controller,
    InternalServerErrorException,
    Post,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import slugify from 'slugify';
import { UploadService } from './upload.service';

@Controller('/api/upload')
export class UploadController {
    private s3: S3Client;
    private url_cloudfront: string;

    constructor(
        private readonly uploadService: UploadService,
        private readonly configService: ConfigService,
    ) {
        this.url_cloudfront = configService.get<string>('AWS_CLOUD_FRONT', "http://localhost:9000");
        this.s3 = new S3Client({
            endpoint: 'http://localhost:9000',
            region: 'us-east-1',
            credentials: {
                accessKeyId: 'admin',
                secretAccessKey: 'password',
            },
            forcePathStyle: true, // Path-style URLs
        });
    }

    /**
     * @POST /upload/s3-multiple
     * Upload nhiều file lên AWS S3
     */
    @Post('s3-multiple')
    @UseInterceptors(FilesInterceptor('files', 10))
    async uploadMultipleToS3(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException('Files are required');
        }
        try {
            const uploadPromises = files.map((file) =>
                this.s3_upload(
                    file.buffer,
                    this.configService.get<string>('AWS_S3_NAME', "uploads"),
                    file.originalname,
                    file.mimetype,
                ),
            );
            const urls = await Promise.all(uploadPromises);
            return { urls, message: 'Files uploaded to S3 successfully' };
        } catch (error) {
            throw new InternalServerErrorException('Failed to upload files to S3');
        }
    }

    /**
     * @POST /upload/local-multiple
     * Lưu trữ nhiều file vào local
     */
    @Post('local-multiple')
    @UseInterceptors(FilesInterceptor('files', 10))
    async uploadMultipleToLocal(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException('Files are required');
        }

        const folderPath = './uploads';
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const filePaths = files.map((file) => {
            const filePath = `${folderPath}/${Date.now()}-${slugify(file.originalname)}`;
            fs.writeFileSync(filePath, file.buffer);
            return filePath;
        });

        return {
            paths: filePaths,
            message: 'Files saved to local successfully',
        };
    }

    /**
     * @private
     * Upload file lên S3
     */
    private async s3_upload(file, bucket, name, mimetype) {
        const key = new Date().getTime() + slugify(name);
        const params = {
            Bucket: bucket,
            Key: key,
            Body: file,
            ContentType: mimetype,
        };

        try {
            const command = new PutObjectCommand(params);
            await this.s3.send(command);
            return this.url_cloudfront + `/${bucket}` + '/' + key;
        } catch (e) {
            throw new InternalServerErrorException('S3 upload failed');
        }
    }
}
