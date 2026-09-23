import { IsOptional, IsEnum, IsString } from 'class-validator';
import { LeadStatus, LeadSource } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryLeadsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
