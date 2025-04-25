import { v4 as uuidv4 } from 'uuid';

export enum TokenType {
    ACCESS_TOKEN = 'accessToken',
    REFRESH_TOKEN = 'refreshToken',
}

export class TokenPayload {
    id: number;
    username: string;
    roles: string[];
    typeToken: TokenType;
    iat: number;
    jti: string;

    constructor(
        id: number,
        username: string,
        roles: string[],
        typeToken: TokenType,
    ) {
        this.id = id;
        this.username = username;
        this.roles = roles;
        this.typeToken = typeToken;
        this.iat = Math.floor(Date.now() / 1000); // đúng chuẩn JWT timestamp
        this.jti = uuidv4(); // gán uuid v4 làm JWT ID
    }
}
