import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: any, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getDashboard(user, query);
  }

  @Get('funnel')
  getFunnel(@CurrentUser() user: any, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getFunnel(user, query);
  }

  @Get('team-performance')
  getTeamPerformance(@CurrentUser() user: any, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getTeamPerformance(user, query);
  }
}
