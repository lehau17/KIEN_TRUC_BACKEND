import { ErrorValidateCode } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class CreateEmployeeDto {
    @ApiProperty({
        example: 'john_doe',
        description: 'Tên đăng nhập của nhân viên',
    })
    @IsString()
    @IsNotEmpty({ message: ErrorValidateCode.USERNAME_REQUIRED })
    username: string;

    @ApiProperty({ example: 'John Doe', description: 'Họ và tên đầy đủ' })
    @IsString()
    @IsNotEmpty({ message: ErrorValidateCode.FULLNAME_REQUIRED })
    fullname: string;

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

    @ApiProperty({
        example: 'john.doe@example.com',
        description: 'Email của nhân viên',
    })
    @IsEmail({}, { message: ErrorValidateCode.EMAIL_INVALID })

    @IsNotEmpty({
        message: ErrorValidateCode.EMAIL_REQUIRED
    })
    email: string;
}
