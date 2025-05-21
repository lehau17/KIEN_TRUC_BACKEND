import {
    MessageDeco,
    MessageResponse,
    Role,
    TokenPayload,
    User
} from '@app/common';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateEmployeeAdminDto } from './dto/create-employee-admin';
import { DeleteEmployeeParamDto } from './dto/delete-employee.dto';
import { FindManyEmployeeDto } from './dto/findMany.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateEmployeeParamDto } from './dto/update-employee.param.dto';
import { EmployeeService } from './employee.service';

@Controller('/api/admin/employees')
@ApiTags('/api/admin/employees')
@ApiBearerAuth()
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) { }

    @Get()
    @ApiBearerAuth()
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'cursor', required: false, type: Number })
    @ApiQuery({ name: 'fullname', required: false, type: String })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiQuery({
        name: 'orderBy',
        required: false,
        default: 'id',
        enum: ['fullname', 'created_at', 'updated_at', 'id'],
    })
    @ApiQuery({ name: 'orderType', required: false, enum: ['ASC', 'DESC'] })
    @MessageDeco(MessageResponse.USER_FIND_MANY)
    @Role(['ADMIN'])
    @ApiOperation({
        summary: 'Chỉ có quyền admin mới có quyền xem danh sách user',
    })
    findMany(@Query() query: FindManyEmployeeDto) {
        return this.employeeService.findMany(query);
    }


    @Post()
    @ApiBearerAuth()
    @MessageDeco(MessageResponse.USER_INFO)
    @Role(['ADMIN', "MANAGER"])
    @ApiOperation({
        summary: 'Tao employee',
    })
    createEmployeeForAmdin(@Body() body: CreateEmployeeAdminDto) {
        return this.employeeService.createAdminEmployee(body);
    }

    @Get('/me')
    @ApiBearerAuth()
    @MessageDeco(MessageResponse.USER_INFO)
    @ApiOperation({
        summary: 'Xem thông tin cá nhân của bản thân thông qua accessToken',
    })
    getMe(@User() { id }: TokenPayload) {
        return this.employeeService.findOne(id);
    }

    @Patch('/me')
    @ApiBearerAuth()
    @MessageDeco(MessageResponse.USER_INFO)
    @ApiOperation({
        summary: 'Update thông tin bản thân',
    })
    updateMe(@User() { id }: TokenPayload, @Body() body: UpdateEmployeeDto) {
        return this.employeeService.updateEmployee(+id, body);
    }

    @Patch('/:id')
    @ApiBearerAuth()
    @Role(['ADMIN'])
    @ApiOperation({ summary: 'Update User Cho role Admin' })
    @MessageDeco(MessageResponse.CHANGE_PASSWORD_SUCCESS)
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID của nhân viên cần cập nhật',
    })
    updateEmployee(
        @Param() { id }: UpdateEmployeeParamDto,
        @Body() body: UpdateEmployeeDto,
    ) {
        return this.employeeService.updateEmployee(+id, body);
    }

    @Delete('/me')
    @ApiBearerAuth()
    @MessageDeco(MessageResponse.USER_REMOVE)
    @Role(['ADMIN', 'USER'])
    @ApiOperation({
        summary: 'deactive tài khoản cho user và admin',
    })
    deleteEmployee(@User() { id }: TokenPayload) {
        return this.employeeService.softDelete(+id);
    }

    @Delete('/:id')
    @ApiBearerAuth()
    @MessageDeco(MessageResponse.USER_REMOVE)
    @Role(['ADMIN'])
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID của nhân viên cần cập nhật',
    })
    @ApiOperation({
        summary: 'deactive tài khoản được sử dụng bởi admin',
    })
    deleteEmployeeRoleAdmin(@Param() { id }: DeleteEmployeeParamDto) {
        return this.employeeService.softDelete(+id);
    }

    @Patch('/:id/change-password')
    @ApiBearerAuth()
    @MessageDeco(MessageResponse.USER_REMOVE)
    @Role(['ADMIN'])
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID của nhân viên cần cập nhật',
    })
    @ApiOperation({
        summary: 'đổi tài khoản được sử dụng bởi admin',
    })
    changePassword(
        @Param() { id }: DeleteEmployeeParamDto,
        @Body() body: ChangePasswordDto,
    ) {
        return this.employeeService.changePassword(+id, body);
    }
}
