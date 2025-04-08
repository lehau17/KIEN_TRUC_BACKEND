import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Status, users } from '@prisma/client';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { compareSync, hashSync } from 'bcrypt';
import { FindManyEmployeeDto } from './dto/findMany.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import {
  mapperUserToUserResponse,
  MessageResponse,
  UserResponseDto,
} from '@app/common';
import { Paging, PagingBuilder } from '@app/common/types/paging';
import { RoleService } from 'src/role/role.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LocalCacheService } from '@app/common/localCache';
@Injectable()
export class EmployeeService {
  private cache: LocalCacheService;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly roleService: RoleService,
  ) {
    this.cache = LocalCacheService.getInstance();
  }

  findByUsername(username: string) {
    return this.prismaService.users.findFirst({
      where: { username },
      include: {
        role: true,
      },
    });
  }

  async create(data: CreateEmployeeDto) {
    const role = await this.roleService.findByName('USER');
    if (!role) {
      throw new BadRequestException(MessageResponse.ROLE_NOT_EXIST);
    }
    return this.prismaService.users.create({
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

  async findOne(id: number): Promise<UserResponseDto | null> {
    const foundUser = await this.prismaService.users.findFirst({
      where: { id },
    });
    return foundUser ? mapperUserToUserResponse(foundUser) : null;
  }

  async findMany({
    limit = 20,
    page = 1,
    cursor,
    isActive,
    fullname = '',
    orderBy = 'id',
    orderType = 'DESC',
  }: FindManyEmployeeDto): Promise<Paging<UserResponseDto>> {
    limit = Number(limit);
    page = Number(page);
    cursor = Number(cursor);
    let status: Status = Status.deactive;
    if (isActive) {
      if (isActive === true) {
        status = Status.active;
      } else {
        status = Status.deactive;
      }
    } else {
      status = undefined;
    }
    const options: Prisma.usersFindManyArgs = {
      take: limit,
      skip: cursor ? 1 : (page - 1) * limit,
      where: {
        id: cursor ? { gte: cursor } : undefined,
        status: status,
        fullname: {
          contains: fullname,
        },
      },
      orderBy: [
        {
          [orderBy]: orderType.toLowerCase(),
        },
      ],
    };

    const [foundUser, total] = await Promise.all([
      this.prismaService.users.findMany(options),
      this.prismaService.users.count({
        where: {
          status,
          fullname: {
            contains: fullname,
          },
        },
      }),
    ]);

    return new PagingBuilder<UserResponseDto>()
      .setLimit(limit)
      .setPage(page)
      .setTotal(total)
      .setData(foundUser)
      .setNextPage(total / page <= limit ? null : page + 1)
      .setPrevPage(page === 1 ? null : page - 1)
      .build();
  }

  // update(id: number, payload: UpdateEmployeeDto) {}

  async softDelete(id: number) {
    const foundUser = await this.findOne(id);
    if (!foundUser || foundUser.status === 'deactive') {
      throw new BadRequestException(MessageResponse.USER_NOT_FOUND);
    }
    const userDelete = await this.prismaService.users.update({
      where: { id },
      data: { status: Status.deactive },
    });
    if (userDelete) {
      await this.cache.set(`BLACKLIST:${userDelete.id}`, '1', 1000 * 60 * 15);
    }
    return userDelete;
  }

  async updateEmployee(
    id: number,
    data: UpdateEmployeeDto,
  ): Promise<UserResponseDto> {
    //check user
    const foundUser = await this.findOne(id);
    if (!foundUser || foundUser.status === 'deactive') {
      throw new BadRequestException(MessageResponse.USER_NOT_FOUND);
    }
    // update user
    const userUpdated = await this.prismaService.users.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });
    return mapperUserToUserResponse(userUpdated);
  }

  async changePassword(
    id: number,
    { oldPassword, newPassword, confirmNewPassword }: ChangePasswordDto,
  ) {
    // check exist
    const foundUser = await this.prismaService.users.findFirst({
      where: {
        id,
      },
    });
    if (!foundUser || foundUser.status === 'deactive') {
      throw new BadRequestException(MessageResponse.USER_NOT_FOUND);
    }
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException(
        MessageResponse.PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCH,
      );
    }
    if (!compareSync(oldPassword, foundUser.password)) {
      throw new BadRequestException(MessageResponse.OLD_PASSWORD_NOT_VALID);
    }
    if (compareSync(newPassword, foundUser.password)) {
      throw new BadRequestException(MessageResponse.NOT_INPUT_OLD_PASSWORD);
    }
    return this.prismaService.users.update({
      where: { id },
      data: {
        password: hashSync(newPassword, 10),
      },
    });
  }
}
