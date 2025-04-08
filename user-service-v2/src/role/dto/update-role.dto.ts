import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'admin', description: 'Tên vai trò' })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Trạng thái của vai trò (true: active, false: deactive)',
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
