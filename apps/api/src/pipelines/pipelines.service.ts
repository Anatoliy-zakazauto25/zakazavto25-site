import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PipelinesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const pipelines = await this.prisma.pipeline.findMany({
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: pipelines };
  }

  async findOne(id: string) {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
        deals: true,
      },
    });

    if (!pipeline) {
      throw new NotFoundException('Воронка не найдена');
    }

    return { success: true, data: pipeline };
  }
}
