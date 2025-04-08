import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123', description: 'Mật khẩu cũ' })
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
  oldPassword: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'Mật khẩu mới',
  })
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
  newPassword: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'Xác nhận mật khẩu mới',
    minLength: 6,
  })
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
  confirmNewPassword: string;
}
