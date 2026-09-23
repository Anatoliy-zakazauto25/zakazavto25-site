import { IsDateString, IsOptional, IsString } from 'class-validator';

export class WinDealDto {
  @IsDateString()
  @IsOptional()
  actualCloseDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
