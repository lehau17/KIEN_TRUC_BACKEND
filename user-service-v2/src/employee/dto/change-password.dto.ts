import { ErrorValidateCode } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

export class ChangePasswordDto {
    @ApiProperty({ example: 'OldPassword123', description: 'Mật khẩu cũ' })
    @IsNotEmpty({ message: ErrorValidateCode.OLD_PASSWORD_REQUIRED })
    @Matches(PASSWORD_RULE, { message: ErrorValidateCode.OLD_PASSWORD_FORMAT })
    oldPassword: string;

    @ApiProperty({ example: 'NewPassword123', description: 'Mật khẩu mới' })
    @IsNotEmpty({ message: ErrorValidateCode.NEW_PASSWORD_REQUIRED })
    @Matches(PASSWORD_RULE, { message: ErrorValidateCode.NEW_PASSWORD_FORMAT })
    newPassword: string;

    @ApiProperty({ example: 'NewPassword123', description: 'Xác nhận mật khẩu mới' })
    @IsNotEmpty({ message: ErrorValidateCode.CONFIRM_NEW_PASSWORD_REQUIRED })
    @Matches(PASSWORD_RULE, { message: ErrorValidateCode.CONFIRM_NEW_PASSWORD_FORMAT })
    confirmNewPassword: string;
}
