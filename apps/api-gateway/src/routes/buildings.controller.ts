import { Body, Controller, Post, Version } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateBuildingDto } from '@app/buildings';

@ApiTags('Buildings')
@Controller('buildings')
export class BuildingsGatewayController {
  constructor(private readonly http: HttpService) {}

  @Post()
  @ApiBody({ type: CreateBuildingDto })
  async create(@Body() dto: CreateBuildingDto) {
    const res = await firstValueFrom(
      // forward to Virtual Facility service
      this.http.post('http://virtual-facility:3001/buildings', dto),
    );
    return res.data;
  }
}
