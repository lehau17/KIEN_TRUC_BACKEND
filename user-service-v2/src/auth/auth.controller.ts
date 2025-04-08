import {
    MessageDeco,
    MessageResponse,
    PublicApi,
    TokenPayload,
    User
} from '@app/common';
import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    Query,
    UnauthorizedException
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiHeader,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ChangePasswordDto } from 'src/employee/dto/change-password.dto';
import { AuthService } from './auth.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('/register')
    @PublicApi()
    @MessageDeco(MessageResponse.USER_CREATED)
    @HttpCode(HttpStatus.CREATED)
    create(@Body() body: CreateEmployeeDto) {
        return this.authService.createEmployee(body);
    }

    @Post('login')
    @PublicApi()
    @MessageDeco(MessageResponse.USER_LOGIN_SUCCESS)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary:
            'Đăng nhập vào hệ thống. có 2 accout là employee và admin, pass mặt định trên swagger',
    })
    login(@Body() body: LoginDto) {
        return this.authService.login(body);
    }

    @Post('refresh-token')
    @PublicApi()
    @MessageDeco(MessageResponse.REFRESH_TOKEN_SUCESS)
    @ApiOperation({ summary: 'Refresh access token' }) // Mô tả API
    @ApiHeader({
        name: 'x-refresh-token',
        description: 'Refresh token for authentication',
        required: true,
    })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    refreshToken(@Headers() refresToken: Record<string, string>) {
        const refreshToken = refresToken['x-refresh-token'];
        if (!refreshToken || refreshToken === '')
            throw new UnauthorizedException(MessageResponse.REFRESH_TOKEN_INVALID);

        return this.authService.refreshToken(refreshToken);
    }

    @Patch('change-password')
    @MessageDeco(MessageResponse.CHANGE_PASSWORD_SUCCESS)
    // @Role(['USER', 'ADMIN'])
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change password for user' })
    changePassword(
        @Body() body: ChangePasswordDto,
        @User() { id }: TokenPayload,
    ) {
        return this.authService.changePassword(+id, body);
    }

    @PublicApi()
    @Get("verify-account")
    verifyAccount(@Query("verifyToken") token: string) {
        if (!token || token === "") {
            return "khong xac thuc loi data"
        }
        return this.authService.verify(token)
    }

    @PublicApi()
    @Post("verify-change-password")
    verifyChangePassword(@Query("verifyToken") token: string) {
        if (!token || token === "") {
            return "khong xac thuc loi data"
        }
        return this.authService.verifyChangePassword(token)
    }


    /**
     *
     * @param param0
     *
     */
    @Post("request-change-password")
    @MessageDeco(MessageResponse.REQUEST_VERIFY_CHANGEP_PASSWORD_SUCCESS)
    @ApiBearerAuth()
    requestChangePassword(@User() { id, username }: TokenPayload) {
        console.log("check id:>>>", id)
        return this.authService.
            requestChangePassword(id, username)
    }
}
