import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsInt, IsOptional } from 'class-validator';

export class PagingDto {
  // @ApiProperty({
  //   description: 'Limit for pagination',
  //   type: Number,
  //   default: 20,
  //   required: false,
  // })
  // @IsEmpty()
  @IsOptional()
  limit?: number;

  // @ApiProperty({
  //   description: 'Page number for pagination',
  //   type: Number,
  //   default: 1,
  //   required: false,
  // })
  // @IsEmpty()
  @IsOptional()
  page?: number;

  // @ApiProperty({
  //   description: 'Cursor for pagination',
  //   type: Number,
  //   required: false,
  // })
  // @IsEmpty()
  @IsOptional()
  cursor?: number;

  fullFill() {
    if (!this.page || this.page < 1) {
      this.page = 1;
    }
    if (!this.limit || this.limit <= 0) {
      this.limit = 20;
    }
    if (this.cursor < 0) {
      this.cursor = null;
    }
  }
}
