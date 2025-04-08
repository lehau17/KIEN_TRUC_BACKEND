import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl, MaxLength, MinLength } from 'class-validator';

export class UpdateEmployeeDto {
  @ApiPropertyOptional({
    description: 'Họ và tên của nhân viên',
    example: 'Nguyễn Văn A',
    required: false,
  })
  @MinLength(3)
  @MaxLength(50)
  @IsOptional()
  fullname?: string;

  @ApiPropertyOptional({
    description: 'URL ảnh đại diện của nhân viên',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  avatar?: string;
}
