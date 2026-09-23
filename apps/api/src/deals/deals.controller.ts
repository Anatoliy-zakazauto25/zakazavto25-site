import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { QueryDealsDto } from './dto/query-deals.dto';
import { ChangeStageDto } from './dto/change-stage.dto';
import { WinDealDto } from './dto/win-deal.dto';
import { LoseDealDto } from './dto/lose-deal.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  create(@Body() createDealDto: CreateDealDto, @CurrentUser() user: any) {
    return this.dealsService.create(createDealDto, user);
  }

  @Get()
  findAll(@Query() query: QueryDealsDto, @CurrentUser() user: any) {
    return this.dealsService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.dealsService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDealDto: UpdateDealDto,
    @CurrentUser() user: any,
  ) {
    return this.dealsService.update(id, updateDealDto, user);
  }

  @Post(':id/change-stage')
  changeStage(
    @Param('id') id: string,
    @Body() changeStageDto: ChangeStageDto,
    @CurrentUser() user: any,
  ) {
    return this.dealsService.changeStage(id, changeStageDto, user);
  }

  @Post(':id/win')
  win(
    @Param('id') id: string,
    @Body() winDealDto: WinDealDto,
    @CurrentUser() user: any,
  ) {
    return this.dealsService.win(id, winDealDto, user);
  }

  @Post(':id/lose')
  lose(
    @Param('id') id: string,
    @Body() loseDealDto: LoseDealDto,
    @CurrentUser() user: any,
  ) {
    return this.dealsService.lose(id, loseDealDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.dealsService.remove(id, user);
  }
}
