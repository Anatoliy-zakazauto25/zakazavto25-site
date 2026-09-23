import { Controller, Get, Query } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { QueryActivitiesDto } from './dto/query-activities.dto';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  findAll(@Query() query: QueryActivitiesDto) {
    return this.activitiesService.findAll(query);
  }
}
