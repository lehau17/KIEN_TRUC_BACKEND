import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class CreateEmployeeDto {
    @ApiProperty({
        example: 'john_doe',
        description: 'Tên đăng nhập của nhân viên',
    })
    @IsString()
    @IsNotEmpty({ message: 'Username không được để trống' })
    username: string;

    @ApiProperty({ example: 'John Doe', description: 'Họ và tên đầy đủ' })
    @IsString()
    @IsNotEmpty({ message: 'Họ và tên không được để trống' })
    fullname: string;

    @ApiProperty({
        example: 'P@ssw0rd!',
        description:
            'Mật khẩu, ít nhất 6 ký tự và có 1 chữ hoa, 1 số, 1 ký tự đặc biệt',
        minLength: 6,
    })
    @IsString()
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
        message:
            'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
    })
    password: string;

    @ApiProperty({
        example: 'john.doe@example.com',
        description: 'Email của nhân viên',
    })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;
}
