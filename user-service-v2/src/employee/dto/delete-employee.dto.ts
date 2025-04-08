import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DeleteEmployeeParamDto {
  @ApiProperty({ example: 1, description: 'ID của nhân viên', type: Number })
  @IsNotEmpty()
  id: number;
}
