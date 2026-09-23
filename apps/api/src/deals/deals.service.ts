import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { QueryDealsDto } from './dto/query-deals.dto';
import { ChangeStageDto } from './dto/change-stage.dto';
import { WinDealDto } from './dto/win-deal.dto';
import { LoseDealDto } from './dto/lose-deal.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async create(createDealDto: CreateDealDto, user: any) {
    const { contactIds, ...dealData } = createDealDto;

    const stage = await this.prisma.pipelineStage.findUnique({
      where: { id: dealData.stageId },
    });

    if (!stage) {
      throw new NotFoundException('Этап воронки не найден');
    }

    const deal = await this.prisma.deal.create({
      data: {
        ...dealData,
        ownerId: user.id,
        probability: stage.probability,
        expectedCloseDate: dealData.expectedCloseDate
          ? new Date(dealData.expectedCloseDate)
          : undefined,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        stage: true,
        pipeline: true,
        company: true,
      },
    });

    if (contactIds && contactIds.length > 0) {
      await this.prisma.dealContact.createMany({
        data: contactIds.map((contactId, index) => ({
          dealId: deal.id,
          contactId,
          isPrimary: index === 0,
        })),
      });
    }

    await this.prisma.activity.create({
      data: {
        type: 'DEAL_CREATED',
        title: 'Сделка создана',
        description: `Создана сделка "${deal.title}"`,
        userId: user.id,
        dealId: deal.id,
      },
    });

    return {
      success: true,
      data: deal,
    };
  }

  async findAll(query: QueryDealsDto, user: any) {
    const {
      page,
      limit,
      status,
      stageId,
      pipelineId,
      ownerId,
      companyId,
      minAmount,
      maxAmount,
      search,
      sortBy,
      sortOrder,
    } = query;

    const where: any = {};

    if (user.role === UserRole.SALES_REP) {
      where.ownerId = user.id;
    }

    if (status) where.status = status;
    if (stageId) where.stageId = stageId;
    if (pipelineId) where.pipelineId = pipelineId;
    if (ownerId) where.ownerId = ownerId;
    if (companyId) where.companyId = companyId;
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const skip = (page - 1) * limit;

    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          stage: true,
          pipeline: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          contacts: {
            include: {
              contact: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.deal.count({ where }),
    ]);

    return {
      success: true,
      data: {
        deals,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    };
  }

  async findOne(id: string, user: any) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        stage: true,
        pipeline: true,
        company: true,
        contacts: {
          include: {
            contact: true,
          },
        },
        tasks: {
          orderBy: { dueDate: 'asc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!deal) {
      throw new NotFoundException('Сделка не найдена');
    }

    await this.checkAccess(deal, user);

    return {
      success: true,
      data: deal,
    };
  }

  async update(id: string, updateDealDto: UpdateDealDto, user: any) {
    const deal = await this.prisma.deal.findUnique({ where: { id } });
    if (!deal) {
      throw new NotFoundException('Сделка не найдена');
    }

    await this.checkAccess(deal, user);

    const { contactIds, stageId, ...dealData } = updateDealDto as any;

    let probability = deal.probability;
    if (stageId) {
      const stage = await this.prisma.pipelineStage.findUnique({
        where: { id: stageId },
      });
      if (stage) {
        probability = stage.probability;
      }
    }

    const updated = await this.prisma.deal.update({
      where: { id },
      data: {
        ...dealData,
        stageId,
        probability,
        expectedCloseDate: dealData.expectedCloseDate
          ? new Date(dealData.expectedCloseDate)
          : undefined,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        stage: true,
        pipeline: true,
        company: true,
      },
    });

    await this.prisma.activity.create({
      data: {
        type: 'DEAL_UPDATED',
        title: 'Сделка обновлена',
        description: `Обновлена сделка "${updated.title}"`,
        userId: user.id,
        dealId: id,
      },
    });

    return {
      success: true,
      data: updated,
    };
  }

  async changeStage(id: string, changeStageDto: ChangeStageDto, user: any) {
    const deal = await this.prisma.deal.findUnique({ where: { id } });
    if (!deal) {
      throw new NotFoundException('Сделка не найдена');
    }

    await this.checkAccess(deal, user);

    const stage = await this.prisma.pipelineStage.findUnique({
      where: { id: changeStageDto.stageId },
    });

    if (!stage) {
      throw new NotFoundException('Этап не найден');
    }

    const updated = await this.prisma.deal.update({
      where: { id },
      data: {
        stageId: changeStageDto.stageId,
        probability: stage.probability,
      },
      include: {
        stage: true,
        pipeline: true,
      },
    });

    await this.prisma.activity.create({
      data: {
        type: 'STATUS_CHANGE',
        title: 'Этап изменен',
        description: `Сделка перемещена в "${stage.name}"`,
        userId: user.id,
        dealId: id,
      },
    });

    return {
      success: true,
      data: updated,
    };
  }

  async win(id: string, winDealDto: WinDealDto, user: any) {
    const deal = await this.prisma.deal.findUnique({ where: { id } });
    if (!deal) {
      throw new NotFoundException('Сделка не найдена');
    }

    await this.checkAccess(deal, user);

    const updated = await this.prisma.deal.update({
      where: { id },
      data: {
        status: 'WON',
        actualCloseDate: winDealDto.actualCloseDate
          ? new Date(winDealDto.actualCloseDate)
          : new Date(),
      },
      include: {
        stage: true,
        pipeline: true,
      },
    });

    await this.prisma.activity.create({
      data: {
        type: 'DEAL_WON',
        title: 'Сделка выиграна',
        description: winDealDto.notes || 'Сделка успешно закрыта',
        userId: user.id,
        dealId: id,
      },
    });

    return {
      success: true,
      data: updated,
    };
  }

  async lose(id: string, loseDealDto: LoseDealDto, user: any) {
    const deal = await this.prisma.deal.findUnique({ where: { id } });
    if (!deal) {
      throw new NotFoundException('Сделка не найдена');
    }

    await this.checkAccess(deal, user);

    const updated = await this.prisma.deal.update({
      where: { id },
      data: {
        status: 'LOST',
        lossReason: loseDealDto.lossReason,
        actualCloseDate: loseDealDto.actualCloseDate
          ? new Date(loseDealDto.actualCloseDate)
          : new Date(),
      },
      include: {
        stage: true,
        pipeline: true,
      },
    });

    await this.prisma.activity.create({
      data: {
        type: 'DEAL_LOST',
        title: 'Сделка проиграна',
        description: loseDealDto.lossReason,
        userId: user.id,
        dealId: id,
      },
    });

    return {
      success: true,
      data: updated,
    };
  }

  async remove(id: string, user: any) {
    const deal = await this.prisma.deal.findUnique({ where: { id } });
    if (!deal) {
      throw new NotFoundException('Сделка не найдена');
    }

    if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      throw new ForbiddenException('Недостаточно прав для удаления');
    }

    await this.prisma.deal.delete({ where: { id } });
    return { success: true, message: 'Сделка удалена' };
  }

  private async checkAccess(deal: any, user: any) {
    if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      return true;
    }

    if (deal.ownerId === user.id) {
      return true;
    }

    throw new ForbiddenException('Нет доступа к этой сделке');
  }
}
