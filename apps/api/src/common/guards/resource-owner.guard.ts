import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;

    if (!resourceId) {
      return true;
    }

    // Admins and super admins can access anything
    if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      return true;
    }

    const resourceType = this.getResourceType(context);
    const isOwner = await this.checkOwnership(resourceType, resourceId, user.id);

    if (!isOwner) {
      throw new ForbiddenException('Нет доступа к этому ресурсу');
    }

    return true;
  }

  private getResourceType(context: ExecutionContext): string {
    const controller = context.getClass().name;
    return controller.replace('Controller', '').toLowerCase();
  }

  private async checkOwnership(
    resourceType: string,
    resourceId: string,
    userId: string,
  ): Promise<boolean> {
    const modelMap: Record<string, string> = {
      leads: 'lead',
      deals: 'deal',
      contacts: 'contact',
      tasks: 'task',
    };

    const modelName = modelMap[resourceType] || resourceType;

    try {
      const resource = await (this.prisma as any)[modelName].findUnique({
        where: { id: resourceId },
        select: { ownerId: true, createdById: true, assigneeId: true, uploadedById: true },
      });

      if (!resource) {
        throw new ForbiddenException('Ресурс не найден');
      }

      return (
        resource.ownerId === userId ||
        resource.createdById === userId ||
        resource.assigneeId === userId ||
        resource.uploadedById === userId
      );
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Нет доступа к этому ресурсу');
    }
  }
}
