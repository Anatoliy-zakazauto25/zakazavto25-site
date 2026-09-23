import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  @Public()
  async health() {
    // Test database connection
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    };
  }

  @Get()
  @Public()
  getHello() {
    return {
      message: 'CRM API is running',
      version: '1.0.0',
      docs: '/api/v1/health',
    };
  }
}
