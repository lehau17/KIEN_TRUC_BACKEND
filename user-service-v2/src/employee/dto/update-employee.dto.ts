import { ErrorValidateCode } from '@app/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl, MaxLength, MinLength } from 'class-validator';

export class UpdateEmployeeDto {
    @ApiPropertyOptional({
        description: 'Họ và tên của nhân viên',
        example: 'Nguyễn Văn A',
    })
    @MinLength(3, { message: ErrorValidateCode.FULLNAME_MIN_LENGTH })
    @MaxLength(50, { message: ErrorValidateCode.FULLNAME_MAX_LENGTH })
    @IsOptional()
    fullname?: string;

    @ApiPropertyOptional({
        description: 'URL ảnh đại diện của nhân viên',
        example: 'https://example.com/avatar.jpg',
    })
    @IsUrl({}, { message: ErrorValidateCode.AVATAR_URL_INVALID })
    @IsOptional()
    avatar?: string;

    @IsOptional()
    email?: string

    @IsOptional()
    role?: string
}
