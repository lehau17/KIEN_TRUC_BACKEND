import { MessageResponse } from '@app/common';
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }
    async onModuleInit() {
        await this.prisma.permissions.deleteMany();
        await this.prisma.resources.deleteMany();
        await this.prisma.users.deleteMany();
        await this.prisma.roles.deleteMany();
        const [admin, user] = await Promise.all([
            this.prisma.roles.create({
                data: {
                    role: 'ADMIN',
                },
            }),
            this.prisma.roles.create({
                data: {
                    role: 'USER',
                },
            }),
        ]);
        await Promise.all([
            this.prisma.users.create({
                data: {
                    email: "admin@gmail.com",
                    fullname: 'ADMIN',
                    username: 'admin',
                    password:
                        '$2b$10$SHOB1BA0XvtMmjPf5V0ziOJzSW71eQHkNKy71ZStEbSkx4uDl6OGC',
                    role: {
                        connect: {
                            id: admin.id,
                        },
                    },
                },
            }),
            this.prisma.users.create({
                data: {
                    email: "user@gmail.com",
                    fullname: 'USER',
                    username: 'user',
                    password:
                        '$2b$10$SHOB1BA0XvtMmjPf5V0ziOJzSW71eQHkNKy71ZStEbSkx4uDl6OGC',
                    role: {
                        connect: {
                            id: user.id,
                        },
                    },
                },
            }),
        ]);
        const [employeeMe, changePassword] = await Promise.all([
            this.prisma.resources.create({
                data: {
                    path: '/employees/me',
                },
            }),
            this.prisma.resources.create({
                data: {
                    path: '/auth/change-password',
                },
            }),
        ]);
        await this.prisma.permissions.createMany({
            data: [
                {
                    role_id: user.id,
                    resource_id: employeeMe.id,
                    permission: 'WRITE_ALL',
                },
                {
                    role_id: user.id,
                    resource_id: employeeMe.id,
                    permission: 'READ_ALL',
                },
                {
                    role_id: user.id,
                    resource_id: changePassword.id,
                    permission: 'WRITE_ALL',
                },
            ],
        });
    }

    async create(data: CreatePermissionDto) {
        // check role and permissions
        const [role, resource] = await Promise.all([
            this.prisma.roles.findFirst({ where: { id: data.role_id } }),
            this.prisma.resources.findFirst({ where: { id: data.resource_id } }),
        ]);
        if (!role || role.status === 'deactive')
            throw new BadRequestException(MessageResponse.ROLE_NOT_EXIST);
        if (!resource || resource.status === 'deactive')
            throw new BadRequestException(MessageResponse.RESOURCE_NOT_EXIST);
        const foundResource = await this.prisma.permissions.findFirst({
            where: {
                role_id: data.role_id,
                resource_id: data.resource_id,
                permission: data.permission,
            },
        });
        if (foundResource)
            throw new BadRequestException(MessageResponse.PERMISSION_EXIST);
        return this.prisma.permissions.create({ data });
    }

    async findAll() {
        return this.prisma.permissions.findMany({
            include: { role: true, resource: true },
        });
    }

    async findOne(id: number) {
        return this.prisma.permissions.findUnique({
            where: { id },
            include: { role: true, resource: true },
        });
    }

    async remove(id: number) {
        const foundPermission = await this.prisma.permissions.findFirst({
            where: { id },
        });
        if (!foundPermission)
            throw new BadRequestException(MessageResponse.PERMISSION_NOT_EXIST);
        return this.prisma.permissions.delete({ where: { id } });
    }

    async update(id: number, data: UpdatePermissionDto) {
        const [foundPermission, role, resource] = await Promise.all([
            this.prisma.permissions.findUnique({
                where: { id },
            }),
            this.prisma.roles.findFirst({ where: { id: data.role_id } }),
            this.prisma.resources.findFirst({ where: { id: data.resource_id } }),
        ]);

        if (!foundPermission)
            throw new BadRequestException(MessageResponse.PERMISSION_NOT_EXIST);
        if (!role || role.status === 'deactive')
            throw new BadRequestException(MessageResponse.ROLE_NOT_EXIST);
        if (!resource || resource.status === 'deactive')
            throw new BadRequestException(MessageResponse.RESOURCE_NOT_EXIST);

        return this.prisma.permissions.update({
            where: { id },
            data,
        });
    }
}
