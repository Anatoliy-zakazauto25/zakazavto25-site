import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, Min } from 'class-validator';
import { DealStatus } from '@prisma/client';

export class CreateDealDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  pipelineId: string;

  @IsString()
  stageId: string;

  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString({ each: true })
  @IsOptional()
  contactIds?: string[];

  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;
}
