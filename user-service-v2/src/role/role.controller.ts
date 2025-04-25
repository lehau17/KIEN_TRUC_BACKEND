import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MessageDeco, MessageResponse, Role } from '@app/common';
import { FindManyRoleDto } from './dto/find-many.dto';

@Controller('role')
@ApiTags('roles')
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiBearerAuth()
  @Role(['ADMIN'])
  @ApiOperation({
    summary: 'Tạo role chỉ với quyền ADMIN',
  })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @Role(['ADMIN'])
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'cursor', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    default: 'id',
    enum: ['fullname', 'created_at', 'updated_at', 'id'],
  })
  @ApiQuery({ name: 'orderType', required: false, enum: ['ASC', 'DESC'] })
  @ApiBearerAuth()
  @MessageDeco(MessageResponse.ROLE_GET_LIST)
  @ApiOperation({ summary: 'Lấy danh sách role' })
  findAll(@Query() paging: FindManyRoleDto) {
    return this.roleService.findMany(paging);
  }

  @ApiOperation({ summary: 'Lấy role theo id cho role ADMIN' })
  @MessageDeco(MessageResponse.GET_ROLE)
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID của role',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Patch(':id')
  @Role(['ADMIN'])
  @ApiOperation({ summary: 'update role theo id cho role ADMIN' })
  @MessageDeco(MessageResponse.UPDATE_ROLE)
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID của role',
  })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @Role(['ADMIN'])
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID của role',
  })
  @ApiOperation({ summary: 'delete role theo id cho role ADMIN' })
  remove(@Param('id') id: string) {
    return this.roleService.softDelete(+id);
  }
}
