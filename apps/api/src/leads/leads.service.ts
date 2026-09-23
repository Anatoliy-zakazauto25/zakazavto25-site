import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto, user: any) {
    const lead = await this.prisma.lead.create({
      data: {
        ...createLeadDto,
        ownerId: createLeadDto.ownerId || user.id,
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
      },
    });

    return {
      success: true,
      data: lead,
    };
  }

  async findAll(query: QueryLeadsDto, user: any) {
    const { page, limit, status, source, ownerId, search, sortBy, sortOrder } = query;

    const where: any = {};

    // Role-based filtering
    if (user.role === UserRole.SALES_REP) {
      where.ownerId = user.id;
    }

    if (status) where.status = status;
    if (source) where.source = source;
    if (ownerId) where.ownerId = ownerId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
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
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      success: true,
      data: {
        leads,
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
    const lead = await this.prisma.lead.findUnique({
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

    if (!lead) {
      throw new NotFoundException('Лид не найден');
    }

    await this.checkAccess(lead, user);

    return {
      success: true,
      data: lead,
    };
  }

  async update(id: string, updateLeadDto: UpdateLeadDto, user: any) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Лид не найден');
    }

    await this.checkAccess(lead, user);

    const updated = await this.prisma.lead.update({
      where: { id },
      data: updateLeadDto,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    await this.prisma.activity.create({
      data: {
        type: 'STATUS_CHANGE',
        title: 'Лид обновлен',
        description: `Статус изменен на ${updateLeadDto.status || lead.status}`,
        userId: user.id,
        leadId: id,
      },
    });

    return {
      success: true,
      data: updated,
    };
  }

  async remove(id: string, user: any) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Лид не найден');
    }

    if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      throw new ForbiddenException('Недостаточно прав для удаления');
    }

    await this.prisma.lead.delete({ where: { id } });
    return { success: true, message: 'Лид успешно удален' };
  }

  async convert(id: string, convertDto: ConvertLeadDto, user: any) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Лид не найден');
    }

    await this.checkAccess(lead, user);

    return this.prisma.$transaction(async (tx) => {
      let companyId: string | undefined;
      if (convertDto.createCompany && convertDto.companyData) {
        const company = await tx.company.create({
          data: convertDto.companyData,
        });
        companyId = company.id;
      }

      const contact = await tx.contact.create({
        data: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          jobTitle: lead.jobTitle,
          companyId,
          notes: lead.notes,
        },
      });

      let deal;
      if (convertDto.createDeal && convertDto.dealData) {
        const stage = await tx.pipelineStage.findUnique({
          where: { id: convertDto.dealData.stageId },
        });

        deal = await tx.deal.create({
          data: {
            title: convertDto.dealData.title,
            amount: convertDto.dealData.amount,
            currency: convertDto.dealData.currency || 'USD',
            pipelineId: convertDto.dealData.pipelineId,
            stageId: convertDto.dealData.stageId,
            ownerId: lead.ownerId || user.id,
            companyId,
            status: 'OPEN',
            probability: stage?.probability || 30,
            expectedCloseDate: convertDto.dealData.expectedCloseDate
              ? new Date(convertDto.dealData.expectedCloseDate)
              : undefined,
          },
        });

        await tx.dealContact.create({
          data: {
            dealId: deal.id,
            contactId: contact.id,
            isPrimary: true,
          },
        });
      }

      await tx.lead.update({
        where: { id },
        data: {
          status: 'CONVERTED',
          convertedToContactId: contact.id,
          convertedAt: new Date(),
        },
      });

      await tx.activity.create({
        data: {
          type: 'DEAL_CREATED',
          title: 'Лид конвертирован',
          description: `Создан контакт ${contact.firstName} ${contact.lastName}${deal ? ` и сделка ${deal.title}` : ''}`,
          userId: user.id,
          leadId: id,
        },
      });

      return {
        success: true,
        data: { contact, deal },
      };
    });
  }

  private async checkAccess(lead: any, user: any) {
    if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      return true;
    }

    if (lead.ownerId === user.id) {
      return true;
    }

    throw new ForbiddenException('Нет доступа к этому лиду');
  }
}
