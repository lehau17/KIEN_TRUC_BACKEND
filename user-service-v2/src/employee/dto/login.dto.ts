import { ErrorValidateCode } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'john_doe', description: 'Tên đăng nhập' })
    @IsString()
    @IsNotEmpty({ message: ErrorValidateCode.USERNAME_REQUIRED })
    username: string;

    @ApiProperty({ example: 'P@ssw0rd!', description: 'Mật khẩu đăng nhập' })
    @IsString()
    @IsNotEmpty({ message: ErrorValidateCode.PASSWORD_REQUIRED })
    password: string;
}
