import { getOrSetCache, moKhoa, redis, yeuCauKhoa } from '@app/common/locking/locking';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Status } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleService } from '../role/role.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FindManyUserDto } from './dto/find-many-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { stringify } from 'querystring';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly roleService: RoleService,
    ) { }

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
                        id: role.id,
                    },
                },
            },
        });
    }


    async findAll(query: FindManyUserDto) {
        const { fullname, status, limit = 10, page = 1 } = query;

        // 🚀 Tạo cacheKey theo query
        const queryString = stringify({ fullname, status, limit, page });
        const cacheKey = `user:list:${queryString}`;
        const lockKey = `lock:${cacheKey}`;

        return await getOrSetCache(cacheKey, async () => {
            const lockValue = await yeuCauKhoa(lockKey, 5000, 2000, 100);

            if (!lockValue) {
                console.warn(`⚠️ Không lấy được lock khi load user list`);
                return null;
            }

            try {
                const users = await this.prisma.users.findMany({
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
                return users;
            } finally {
                await moKhoa(lockKey, lockValue);
            }
        }, 300); // Cache 5 phút
    }
    async findOne(id: number) {
        const cacheKey = `user:detail:${id}`;
        const lockKey = `lock:${cacheKey}`;

        return await getOrSetCache(cacheKey, async () => {
            const lockValue = await yeuCauKhoa(lockKey, 5000, 2000, 100); // TTL=5s, timeout=2s

            if (!lockValue) {
                console.warn(`⚠️ Không lấy được lock khi load user ${id}`);
                return null;
            }

            try {
                const user = await this.prisma.users.findUnique({ where: { id } });
                if (!user || user.status === Status.deactive) {
                    throw new BadRequestException('User not found or inactive');
                }
                return user;
            } finally {
                await moKhoa(lockKey, lockValue); // ✅ giải phóng lock
            }
        }, 300); // TTL Redis 5 phút
    }

    async update(id: number, data: UpdateUserDto) {
        const updatedUser = await this.prisma.users.update({
            where: { id },
            data,
        });

        // ❗ Xoá cache sau update
        await redis.del(`user:detail:${id}`);

        return updatedUser;
    }

    async softDelete(id: number) {
        const deletedUser = await this.prisma.users.update({
            where: { id },
            data: { status: Status.deactive },
        });

        // ❗ Xoá cache sau soft delete
        await redis.del(`user:detail:${id}`);

        return deletedUser;
    }
}
