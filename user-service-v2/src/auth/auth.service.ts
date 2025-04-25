import {
    DistributeCache,
    MessageResponse,
    TokenFactory,
    TokenPayload,
    TokenType,
} from '@app/common';
import { mapperUserToUserResponse } from '@app/common/mapper/userMapper';
import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Status } from '@prisma/client';
import { compareSync } from 'bcrypt';
import { ChangePasswordDto } from 'src/employee/dto/change-password.dto';
import { LoginResponseDto } from 'src/employee/dto/login.response.dto';
import { EmployeeService } from 'src/employee/employee.service';
import { JsonWebTokenService } from 'src/jwt/jwt.service';
import { TokenPayloadCreateDto } from 'src/jwt/payloadCreate.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { LoginDto } from './dto/login.dto';
@Injectable()
export class AuthService {
    private disCache: DistributeCache
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jsonWebTokenService: JsonWebTokenService,
        private readonly employeeService: EmployeeService,
        @Inject("MATH_SERVICE") private readonly mailService: ClientProxy
    ) {
        this.disCache = DistributeCache.getInstance()
    }

    async login(login: LoginDto): Promise<LoginResponseDto> {
        // find by Username
        const foundUser = await this.employeeService.findByUsername(login.username);
        // if not found, throw exception
        if (!foundUser) {
            throw new BadRequestException(MessageResponse.USER_NOT_FOUND);
        }
        if (foundUser.status === Status.deactive) {
            throw new BadRequestException(MessageResponse.USER_DEACTIVATED);
        }
        // compare password
        const isPasswordMatch = compareSync(login.password, foundUser.password);
        if (!isPasswordMatch) {
            throw new BadRequestException(MessageResponse.USER_INVALID_PASSWORD);
        }
        const roles = [foundUser.role.role];
        const tokens =
            await this.jsonWebTokenService.signAccessTokenAndRefreshToken(
                foundUser.id,
                foundUser.username,
                roles,
            );
        await this.prismaService.users.update({
            where: { id: foundUser.id },
            data: {
                refresh_token: tokens.refreshToken,
            },
        });
        foundUser.refresh_token = tokens.refreshToken;

        return {
            info: mapperUserToUserResponse(foundUser),
            tokens,
        };
    }

    async createEmployee(payload: CreateEmployeeDto) {
        // check username
        const existingEmployee = await this.employeeService.findByUsername(
            payload.username,
        );
        // if  found, throw exception
        if (existingEmployee) {
            throw new BadRequestException(MessageResponse.USER_EXISTED);
        }
        // create user
        const newUser = await this.employeeService.create(payload);
        // notify service
        if (!newUser) {
            throw new BadRequestException(MessageResponse.SERVER_ERROR)
        }
        const keyRedis = this.genKeyVerifyAccount(newUser.email)
        const [jwtVerify, isSuccess] = await Promise.all([
            this.jsonWebTokenService.genTokenValidateAccount(newUser.email),
            this.disCache.setTTLString(keyRedis, "OK", 60 * 15 * 1000 * 1000)
        ])


        this.mailService.emit('sendMail', {
            to: [newUser.email],
            context: {
                verificationUrl:
                    process.env.URL_BACKEND +
                    `/auth/verify-account?verifyToken=${jwtVerify}`,
                customerName: newUser.fullname,
                year: new Date().getFullYear(),
            },
            subject: 'Verify Accout',
            template: './verify-email.hbs',
        });
        return newUser
    }




    async refreshToken(
        refreshToken: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const decoded =
            await this.jsonWebTokenService.verifyRefreshToken(refreshToken);
        if (!decoded)
            throw new UnauthorizedException(MessageResponse.REFRESH_TOKEN_INVALID);
        const user = await this.employeeService.findOne(decoded.id);
        if (!user) {
            throw new BadRequestException(MessageResponse.USER_NOT_FOUND);
        }

        const newPayloadRefreshToken: TokenPayload = TokenFactory.createAccessToken(
            decoded.id,
            decoded.username,
            decoded.roles,
        );
        const newPayloadAccessToken: TokenPayloadCreateDto = {
            username: decoded.username,
            roles: decoded.roles,
            id: decoded.id,
            typeToken: TokenType.ACCESS_TOKEN,
        };
        const [accessToken, newRefreshToken] = await Promise.all([
            this.jsonWebTokenService.signToken(newPayloadAccessToken),
            this.jsonWebTokenService.signTokenFullPayload(newPayloadRefreshToken),
        ]);
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }

    async changePassword(id: number, body: ChangePasswordDto) {
        return this.employeeService.changePassword(id, body);
    }


    async verify(token: string): Promise<boolean> {
        const isValid = this.jsonWebTokenService.verifyVerifyToken(token)
        if (!isValid) {
            throw new BadRequestException(MessageResponse.ERROR_OCCUR_WHEN_VERIFY_ACCOUNT)
        }
        const decode = this.jsonWebTokenService.decode<{ email: string }>(token)
        // check email in redis if exist
        const email = decode.email
        const keyVerifyRedis = this.genKeyVerifyAccount(email)
        const isExist = await this.disCache.getString(keyVerifyRedis)
        if (!isExist) {
            throw new BadRequestException(MessageResponse.ERROR_OCCUR_WHEN_VERIFY_ACCOUNT)
        }

        // remove in redis and change status of user
        await Promise.all([
            this.disCache.deleteKey(keyVerifyRedis),
            this.prismaService.users.update({
                where: {
                    email,
                },
                data: {
                    status: 'active'
                }
            })
        ])
        return isValid
    }



    async requestChangePassword(id: number, username: string): Promise<boolean> {
        // check id voi username
        const foundUser = await this.prismaService.users.findFirst({
            where: { id }
        })
        if (!foundUser || foundUser.username !== username) {
            // socket IO remove accessToken and logout
            throw new UnauthorizedException(MessageResponse.UNAUTHORIZE)
        }
        if (foundUser.status !== "active") {
            throw new ForbiddenException(MessageResponse.ACCOUNT_NOT_AUTHORIZE)
        }
        const keyRedis = this.genKeyVerifyChangePassword(foundUser.email)
        const [jwtVerify, _] = await Promise.all([
            this.jsonWebTokenService.genTokenValidateAccount(foundUser.email),
            this.disCache.setTTLString(keyRedis, "OK", 60 * 15 * 1000 * 1000)
        ])
        // send mail verify change password
        this.mailService.emit('sendMail', {
            to: [foundUser.email],
            context: {
                verificationUrl:
                    process.env.URL_BACKEND +
                    `/auth/verify-change-password?verifyToken=${jwtVerify}`,
                customerName: foundUser.fullname,
                year: new Date().getFullYear(),
            },
            subject: 'Verify Change Password',
            template: './verify-change-password.hbs',
        });
        return true

    }



    async verifyChangePassword(token: string): Promise<boolean> {
        const isValid = this.jsonWebTokenService.verifyVerifyToken(token)
        if (!isValid) {
            throw new ForbiddenException()
        }
        const decode = this.jsonWebTokenService.decode<{ email: string }>(token)
        // check email in redis if exist
        const email = decode.email
        const keyVerifyRedis = this.genKeyVerifyChangePassword(email)
        const isExist = await this.disCache.getString(keyVerifyRedis)
        if (!isExist) {
            throw new ForbiddenException()
        }

        // remove in redis and change status of user
        await Promise.all([
            this.disCache.deleteKey(keyVerifyRedis),
            this.disCache.setTTLString(this.genKeyRequestChangePassword(email), "OK", 15 * 60)
        ])
        return isValid
    }





    private genKeyVerifyAccount(value: string): string {
        return `verify:${value}`
    }

    private genKeyVerifyChangePassword(value: string | number): string {
        return `req:change-pwd:${value}`
    }

    private genKeyRequestChangePassword(value: string | number): string {
        return `change-pwd:${value}`
    }


}
