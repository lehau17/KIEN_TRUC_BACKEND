import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { FindManyUserDto } from './dto/find-many-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('/api/User') // 👈 Thêm tag cho swagger
@Controller('/api/user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @ApiOperation({ summary: 'Tạo mới user' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách user' })
    findAll(@Query() query: FindManyUserDto) {
        return this.userService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy thông tin chi tiết user' })
    @ApiParam({ name: 'id', type: Number })
    findOne(@Param('id') id: string) {
        return this.userService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật thông tin user' })
    @ApiParam({ name: 'id', type: Number })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(+id, updateUserDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xoá mềm user (deactive)' })
    @ApiParam({ name: 'id', type: Number })
    remove(@Param('id') id: string) {
        return this.userService.softDelete(+id);
    }
}
