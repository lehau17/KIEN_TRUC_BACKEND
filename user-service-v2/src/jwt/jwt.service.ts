import { TokenPayload, TokenType } from '@app/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 } from 'uuid';
import { TokenPayloadCreateDto } from './payloadCreate.dto';

@Injectable()
export class JsonWebTokenService {
    private accessTokenKey: string;
    private refreshTokenKey: string;
    private expiresAccessToken: string;
    private expiresRefreshToken: string;
    private verifyTokenKey: string;
    private expireVerifyToken: string;
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.accessTokenKey = this.configService.get<string>(
            'JWT_ACCESS_TOKEN_SECRET',
        );
        this.refreshTokenKey = this.configService.get<string>(
            'JWT_REFRESH_TOKEN_SECRET',
        );
        this.expiresAccessToken = this.configService.get<string>(
            'JWT_ACCESS_TOKEN_EXPIRES',
        );
        this.expiresRefreshToken = this.configService.get<string>(
            'JWT_REFRESH_TOKEN_EXPIRES',
        );
        this.verifyTokenKey = this.configService.get<string>(
            'JWT_VERIFY_TOKEN_SECRET',
        );
        this.expireVerifyToken = this.configService.get<string>(
            'JWT_VERIFY_TOKEN_EXPIRES',
        );
    }

    async signToken(payload: TokenPayloadCreateDto): Promise<string> {
        return this.jwtService.signAsync({
            ...payload,
            jti: v4(),
            iss: "my-key"
        }, {
            secret:
                payload.typeToken === TokenType.ACCESS_TOKEN
                    ? this.accessTokenKey
                    : this.refreshTokenKey,
            expiresIn:
                payload.typeToken === TokenType.ACCESS_TOKEN
                    ? this.expiresAccessToken
                    : this.expiresRefreshToken,
        });
    }

    verifyAccessToken(token: string): boolean {
        try {
            this.jwtService.verify(token, {
                secret: this.accessTokenKey,
            });
            return true;
        } catch (error) {
            return false;
        }
    }


    verifyVerifyToken(token: string): boolean {
        try {
            this.jwtService.verify(token, {
                secret: this.verifyTokenKey,
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async verifyRefreshToken(token: string): Promise<TokenPayload | null> {
        try {
            const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
                secret: this.refreshTokenKey,
            });
            return payload;
        } catch (error) {
            return null;
        }
    }

    async signTokenFullPayload(payload: TokenPayload): Promise<string> {
        return this.jwtService.signAsync(
            { ...payload },
            {
                secret:
                    payload.typeToken === TokenType.ACCESS_TOKEN
                        ? this.accessTokenKey
                        : this.refreshTokenKey,
                expiresIn:
                    payload.typeToken === TokenType.ACCESS_TOKEN
                        ? this.expiresAccessToken
                        : this.expiresRefreshToken,
            },
        );
    }

    decodeAccessToken(token: string): TokenPayload {
        return this.jwtService.decode(token) as TokenPayload;
    }


    decode<T>(token: string): T {
        return this.jwtService.decode(token) as T
    }


    async genTokenValidateAccount(email: string): Promise<string> {
        return this.jwtService.signAsync(
            { email },
            {
                secret:
                    this.verifyTokenKey,
                expiresIn: this.expireVerifyToken
            },
        );
    }

    async signAccessTokenAndRefreshToken(
        id: number,
        username: string,
        roles: string[],
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const accessTokenPayload: TokenPayloadCreateDto = {
            id,
            username: username,
            roles,
            typeToken: TokenType.ACCESS_TOKEN,
        };
        const refreshTokenPayload: TokenPayloadCreateDto = {
            id,
            username: username,
            roles,
            typeToken: TokenType.REFRESH_TOKEN,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.signToken(accessTokenPayload),
            this.signToken(refreshTokenPayload),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
}
