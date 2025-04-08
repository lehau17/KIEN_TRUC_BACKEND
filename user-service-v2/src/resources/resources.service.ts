import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { MessageResponse } from '@app/common';

@Injectable()
export class ResourcesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}
  onModuleInit() {}

  async create(data: CreateResourceDto) {
    // check path
    const foundResource = await this.prisma.resources.findFirst({
      where: {
        path: {
          contains: data.path,
        },
      },
    });
    if (foundResource) {
      throw new BadRequestException(MessageResponse.RESOURCE_EXIST);
    }
    return this.prisma.resources.create({ data });
  }

  async findAll() {
    return this.prisma.resources.findMany();
  }

  async findOne(id: number) {
    return this.prisma.resources.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateResourceDto) {
    const foundResource = await this.prisma.resources.findFirst({
      where: { id },
    });
    if (!foundResource)
      throw new BadRequestException(MessageResponse.RESOURCE_NOT_EXIST);
    return this.prisma.resources.update({ where: { id }, data });
  }

  async remove(id: number) {
    const foundResource = await this.prisma.resources.findFirst({
      where: { id },
    });
    if (!foundResource)
      throw new BadRequestException(MessageResponse.RESOURCE_NOT_EXIST);
    return this.prisma.resources.update({
      where: { id },
      data: {
        status: 'deactive',
      },
    });
  }
}
