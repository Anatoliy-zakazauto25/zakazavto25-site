import { IsBoolean, IsOptional, ValidateNested, IsString, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class DealDataDto {
  @IsString()
  title: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  pipelineId: string;

  @IsString()
  stageId: string;

  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;
}

class CompanyDataDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  industry?: string;
}

export class ConvertLeadDto {
  @IsBoolean()
  createDeal: boolean;

  @ValidateNested()
  @Type(() => DealDataDto)
  @IsOptional()
  dealData?: DealDataDto;

  @IsBoolean()
  @IsOptional()
  createCompany?: boolean;

  @ValidateNested()
  @Type(() => CompanyDataDto)
  @IsOptional()
  companyData?: CompanyDataDto;
}
