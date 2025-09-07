import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class ClassifyAlarmDto {
  @ApiProperty({ example: 'Alarm #101' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 12, minimum: 1 })
  @IsInt()
  @Min(1)
  buildingId!: number;
}
export class CreateAlarmDto extends ClassifyAlarmDto {}
