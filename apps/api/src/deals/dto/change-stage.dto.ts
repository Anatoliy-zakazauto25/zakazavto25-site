import { IsString } from 'class-validator';

export class ChangeStageDto {
  @IsString()
  stageId: string;
}
