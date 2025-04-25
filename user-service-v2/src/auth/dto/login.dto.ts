import { ErrorValidateCode } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: 'admin',
        description: 'Tên đăng nhập của nhân viên',
    })
    @IsString()
    @IsNotEmpty({ message: ErrorValidateCode.USERNAME_REQUIRED })
    username: string;

    @ApiProperty({
        example: 'P@ssw0rd!',
        description:
            'Mật khẩu, ít nhất 6 ký tự và có 1 chữ hoa, 1 số, 1 ký tự đặc biệt',
        minLength: 6,
    })
    @IsString()
    @IsNotEmpty({ message: ErrorValidateCode.PASSWORD_REQUIRED })
    @MinLength(6, { message: ErrorValidateCode.PASSWORD_MIN_LENGTH })
    @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
        message: ErrorValidateCode.PASSWORD_FORMAT,
    })
    password: string;
}
