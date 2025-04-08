import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JsonWebTokenModule } from 'src/jwt/jwt.module';
import { JsonWebTokenService } from 'src/jwt/jwt.service';
import { RoleService } from 'src/role/role.service';

@Module({
  imports: [JsonWebTokenModule],
  controllers: [EmployeeController],
  providers: [EmployeeService, PrismaService, JsonWebTokenService, RoleService],
})
export class EmployeeModule {}
