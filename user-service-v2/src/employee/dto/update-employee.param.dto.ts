import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateEmployeeParamDto {
  @ApiProperty({ example: 1, description: 'ID của nhân viên', type: Number })
  @IsNotEmpty()
  id: number;
}
