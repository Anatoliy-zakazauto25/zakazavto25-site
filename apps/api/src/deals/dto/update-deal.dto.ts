import { PartialType } from '@nestjs/mapped-types';
import { CreateDealDto } from './create-deal.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { DealStatus } from '@prisma/client';

export class UpdateDealDto extends PartialType(CreateDealDto) {
  @IsEnum(DealStatus)
  @IsOptional()
  status?: DealStatus;
}
