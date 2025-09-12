import { Body, Controller, Inject, Post } from '@nestjs/common';
import { GatewayNatsProxy } from '../brokers/gateway-nats.proxy';
import { ack, ask } from '../brokers/rx';
import { ClassifyAlarmDto, CreateAlarmDto } from '@app/alarms';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import Redis from 'ioredis';
import { ConfigXService } from '../core/config/config.service';

@ApiTags('Alarms')
@Controller('alarms')
export class AlarmsController {
  constructor(
    private readonly nats: GatewayNatsProxy,
    @Inject('REDIS') private readonly redis: Redis,
    private readonly configService: ConfigXService,
  ) {}

  // request/response via NATS
  @Post('classify')
  @ApiBody({ type: ClassifyAlarmDto })
  async classify(@Body() dto: ClassifyAlarmDto) {
    const key = `cls:${dto.name}:${dto.buildingId}`;
    const cached = await this.redis.get(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        await this.redis.del(key);
      }
    }
    const timeout = this.configService.brokerTimeoutMs;
    const retries = this.configService.brokerRetries;
    const res = await ask(
      this.nats.send('alarm.classify', dto),
      timeout,
      retries,
    );
    const cacheTtl = this.configService.classifyCacheTtl;
    await this.redis.set(key, JSON.stringify(res), 'PX', cacheTtl);
    return res;
  } // { category: 'critical'|'non-critical'|'invalid' }

  // fire-and-forget via NATS
  @Post()
  async create(@Body() dto: CreateAlarmDto) {
    const timeout = this.configService.brokerTimeoutMs;
    await ack(this.nats.emit('alarm.created', dto), timeout);
    return { ok: true };
  }
}
