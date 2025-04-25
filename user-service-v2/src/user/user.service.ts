import { BadRequestException, Injectable } from '@nestjs/common';
import { Status } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleService } from '../role/role.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FindManyUserDto } from './dto/find-many-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService, private readonly roleService: RoleService) { }

    async create(data: CreateUserDto) {
        const role = await this.roleService.findByName('USER');

        const exist = await this.prisma.users.findFirst({
            where: { username: data.username },
        });
        if (exist) {
            throw new BadRequestException('Username already exists');
        }

        return this.prisma.users.create({
            data: {
                ...data,
                password: hashSync(data.password, 10),
                role: {
                    connect: {
                        id: role.id
                    }
                }
            },
        });
    }

    async findAll(query: FindManyUserDto) {
        const { fullname, status, limit = 10, page = 1 } = query;
        return this.prisma.users.findMany({
            where: {
                fullname: fullname ? { contains: fullname } : undefined,
                status,
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                created_at: 'desc',
            },
        });
    }

    async findOne(id: number) {
        return this.prisma.users.findUnique({ where: { id } });
    }

    async update(id: number, data: UpdateUserDto) {
        return this.prisma.users.update({
            where: { id },
            data,
        });
    }

    async softDelete(id: number) {
        return this.prisma.users.update({
            where: { id },
            data: { status: Status.deactive },
        });
    }
}
