import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBuildingDto {
  @ApiProperty({ example: 'Building A', description: 'Name of the building' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
