import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(user: any, query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.getPeriodDates(query);

    const [revenue, deals, leads, activities] = await Promise.all([
      this.getRevenueMetrics(startDate, endDate, user),
      this.getDealsMetrics(startDate, endDate, user),
      this.getLeadsMetrics(startDate, endDate, user),
      this.getActivitiesMetrics(startDate, endDate, user),
    ]);

    return {
      success: true,
      data: {
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        revenue,
        deals,
        leads,
        activities,
      },
    };
  }

  async getFunnel(user: any, query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.getPeriodDates(query);

    const baseWhere: any = {};
    if (user.role === UserRole.SALES_REP) {
      baseWhere.ownerId = user.id;
    }

    const stages = await this.prisma.pipelineStage.findMany({
      where: { pipeline: { isActive: true } },
      orderBy: { order: 'asc' },
      include: {
        pipeline: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const funnelData = await Promise.all(
      stages.map(async (stage) => {
        const dealsInStage = await this.prisma.deal.findMany({
          where: {
            ...baseWhere,
            stageId: stage.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        const totalAmount = dealsInStage.reduce((sum, deal) => sum + deal.amount, 0);
        const avgDealSize = dealsInStage.length > 0 ? totalAmount / dealsInStage.length : 0;

        return {
          id: stage.id,
          name: stage.name,
          probability: stage.probability,
          order: stage.order,
          pipelineName: stage.pipeline.name,
          dealsCount: dealsInStage.length,
          totalAmount,
          avgDealSize,
        };
      }),
    );

    return {
      success: true,
      data: { stages: funnelData },
    };
  }

  async getTeamPerformance(user: any, query: AnalyticsQueryDto) {
    // Only admins and managers can see team performance
    if (user.role === UserRole.SALES_REP) {
      return {
        success: true,
        data: {
          message: 'Доступно только для менеджеров и администраторов',
          managers: [],
        },
      };
    }

    const { startDate, endDate } = this.getPeriodDates(query);

    const users = await this.prisma.user.findMany({
      where: {
        role: UserRole.SALES_REP,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
      },
    });

    const performance = await Promise.all(
      users.map(async (u) => {
        const [dealsWon, dealsTotal, leadsTotal, tasksDone] = await Promise.all([
          this.prisma.deal.findMany({
            where: {
              ownerId: u.id,
              status: 'WON',
              actualCloseDate: {
                gte: startDate,
                lte: endDate,
              },
            },
          }),
          this.prisma.deal.count({
            where: {
              ownerId: u.id,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          }),
          this.prisma.lead.count({
            where: {
              ownerId: u.id,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          }),
          this.prisma.task.count({
            where: {
              assigneeId: u.id,
              status: 'DONE',
              completedAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          }),
        ]);

        const revenue = dealsWon.reduce((sum, deal) => sum + deal.amount, 0);

        return {
          user: u,
          revenue,
          dealsWon: dealsWon.length,
          dealsTotal,
          leadsTotal,
          tasksDone,
        };
      }),
    );

    return {
      success: true,
      data: {
        managers: performance,
      },
    };
  }

  private async getRevenueMetrics(startDate: Date, endDate: Date, user: any) {
    const where: any = {
      status: 'WON',
      actualCloseDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (user.role === UserRole.SALES_REP) {
      where.ownerId = user.id;
    }

    const wonDeals = await this.prisma.deal.findMany({ where });
    const total = wonDeals.reduce((sum, deal) => sum + deal.amount, 0);

    const openWhere: any = { status: 'OPEN' };
    if (user.role === UserRole.SALES_REP) {
      openWhere.ownerId = user.id;
    }
    const openDeals = await this.prisma.deal.findMany({ where: openWhere });
    const pipeline = openDeals.reduce((sum, deal) => sum + deal.amount, 0);

    return {
      total,
      won: total,
      pipeline,
      dealsWon: wonDeals.length,
    };
  }

  private async getDealsMetrics(startDate: Date, endDate: Date, user: any) {
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (user.role === UserRole.SALES_REP) {
      where.ownerId = user.id;
    }

    const deals = await this.prisma.deal.groupBy({
      by: ['status'],
      where,
      _count: true,
      _sum: {
        amount: true,
      },
    });

    const total = deals.reduce((sum, g) => sum + g._count, 0);
    const won = deals.find((g) => g.status === 'WON')?._count || 0;
    const lost = deals.find((g) => g.status === 'LOST')?._count || 0;
    const open = deals.find((g) => g.status === 'OPEN')?._count || 0;
    const abandoned = deals.find((g) => g.status === 'ABANDONED')?._count || 0;

    const winRate = won + lost > 0 ? (won / (won + lost)) * 100 : 0;

    const wonAmount = deals.find((g) => g.status === 'WON')?._sum?.amount || 0;
    const avgDealSize = won > 0 ? wonAmount / won : 0;

    return {
      total,
      open,
      won,
      lost,
      abandoned,
      winRate: parseFloat(winRate.toFixed(2)),
      avgDealSize: parseFloat(avgDealSize.toFixed(2)),
    };
  }

  private async getLeadsMetrics(startDate: Date, endDate: Date, user: any) {
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (user.role === UserRole.SALES_REP) {
      where.ownerId = user.id;
    }

    const leads = await this.prisma.lead.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    const total = leads.reduce((sum, g) => sum + g._count, 0);
    const converted = leads.find((g) => g.status === 'CONVERTED')?._count || 0;
    const conversionRate = total > 0 ? (converted / total) * 100 : 0;

    return {
      total,
      new: leads.find((g) => g.status === 'NEW')?._count || 0,
      contacted: leads.find((g) => g.status === 'CONTACTED')?._count || 0,
      qualified: leads.find((g) => g.status === 'QUALIFIED')?._count || 0,
      converted,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    };
  }

  private async getActivitiesMetrics(startDate: Date, endDate: Date, user: any) {
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (user.role === UserRole.SALES_REP) {
      where.userId = user.id;
    }

    const activities = await this.prisma.activity.groupBy({
      by: ['type'],
      where,
      _count: true,
    });

    return {
      calls: activities.find((a) => a.type === 'CALL')?._count || 0,
      meetings: activities.find((a) => a.type === 'MEETING')?._count || 0,
      emails: activities.find((a) => a.type === 'EMAIL')?._count || 0,
      notes: activities.find((a) => a.type === 'NOTE')?._count || 0,
      total: activities.reduce((sum, a) => sum + a._count, 0),
    };
  }

  private getPeriodDates(query: AnalyticsQueryDto): { startDate: Date; endDate: Date } {
    if (query.startDate && query.endDate) {
      return {
        startDate: new Date(query.startDate),
        endDate: new Date(query.endDate),
      };
    }

    const now = new Date();
    let startDate: Date;

    switch (query.period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    return {
      startDate,
      endDate: now,
    };
  }
}
