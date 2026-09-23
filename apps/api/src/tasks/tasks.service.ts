import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: any) {
    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        createdById: user.id,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create notification for assignee
    if (createTaskDto.assigneeId && createTaskDto.assigneeId !== user.id) {
      await this.notificationsService.create(
        createTaskDto.assigneeId,
        'TASK_ASSIGNED',
        'Новая задача',
        `Вам назначена задача "${task.title}"`,
        `/tasks/${task.id}`,
      );
    }

    return { success: true, data: task };
  }

  async findAll(query: QueryTasksDto, user: any) {
    const {
      page,
      limit,
      status,
      priority,
      type,
      assigneeId,
      leadId,
      dealId,
      contactId,
      dueDateFrom,
      dueDateTo,
    } = query;

    const where: any = {};

    if (user.role === UserRole.SALES_REP) {
      where.OR = [
        { assigneeId: user.id },
        { createdById: user.id },
      ];
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (assigneeId) where.assigneeId = assigneeId;
    if (leadId) where.leadId = leadId;
    if (dealId) where.dealId = dealId;
    if (contactId) where.contactId = contactId;
    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo);
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'asc' },
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          deal: {
            select: {
              id: true,
              title: true,
            },
          },
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      success: true,
      data: {
        tasks,
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
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        lead: true,
        deal: true,
        contact: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    await this.checkAccess(task, user);

    return { success: true, data: task };
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: any) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    await this.checkAccess(task, user);

    const data: any = { ...updateTaskDto };
    if (updateTaskDto.dueDate) {
      data.dueDate = new Date(updateTaskDto.dueDate);
    }

    if (updateTaskDto.status === 'DONE') {
      data.completedAt = new Date();
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return { success: true, data: updated };
  }

  async remove(id: string, user: any) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role) && task.createdById !== user.id) {
      throw new ForbiddenException('Нет прав для удаления задачи');
    }

    await this.prisma.task.delete({ where: { id } });
    return { success: true, message: 'Задача удалена' };
  }

  private async checkAccess(task: any, user: any) {
    if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      return true;
    }

    if (task.assigneeId === user.id || task.createdById === user.id) {
      return true;
    }

    throw new ForbiddenException('Нет доступа к этой задаче');
  }
}
