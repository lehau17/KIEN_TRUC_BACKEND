import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { EmployeeModule } from './employee/employee.module';
import { JsonWebTokenModule } from './jwt/jwt.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PrismaModule } from './prisma/prisma.module';
import { ResourcesModule } from './resources/resources.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
@Global()
@Module({
    imports: [
        EmployeeModule,
        PrismaModule,
        JwtModule.register({
            global: true,
        }),
        ConfigModule.forRoot({ isGlobal: true }),
        JsonWebTokenModule,
        AuthModule,
        RoleModule,
        ResourcesModule,
        PermissionsModule,
        UserModule,
    ],
})
export class AppModule { }
