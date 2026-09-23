import { IsDateString, IsOptional, IsString } from 'class-validator';

export class LoseDealDto {
  @IsString()
  lossReason: string;

  @IsDateString()
  @IsOptional()
  actualCloseDate?: string;
}
