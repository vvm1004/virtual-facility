import { Body, Controller, Inject, Post } from '@nestjs/common';
import { GatewayNatsProxy } from '../brokers/gateway-nats.proxy';
import { ack, ask } from '../brokers/rx';
import { ClassifyAlarmDto, CreateAlarmDto } from '@app/alarms';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import Redis from 'ioredis';
const CLASSIFY_TTL = Number(process.env.CLASSIFY_CACHE_TTL ?? 5_000);

@ApiTags('Alarms')
@Controller('alarms')
export class AlarmsController {
  constructor(
    private readonly nats: GatewayNatsProxy,
    @Inject('REDIS') private readonly redis: Redis,
  ) {}

  // request/response via NATS
  @Post('classify')
  @ApiBody({ type: ClassifyAlarmDto })
  async classify(@Body() dto: ClassifyAlarmDto) {
    const key = `cls:${dto.name}:${dto.buildingId}`;
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    const timeout = Number(process.env.BROKER_TIMEOUT_MS ?? 3000);
    const retries = Number(process.env.BROKER_RETRIES ?? 1);
    const res = await ask(
      this.nats.send('alarm.classify', dto),
      timeout,
      retries,
    );
    await this.redis.set(key, JSON.stringify(res), 'PX', CLASSIFY_TTL);
    return res;
  } // { category: 'critical'|'non-critical'|'invalid' }

  // fire-and-forget via NATS
  @Post()
  async create(@Body() dto: CreateAlarmDto) {
    const timeout = Number(process.env.BROKER_TIMEOUT_MS ?? 3000);
    await ack(this.nats.emit('alarm.created', dto), timeout);
    return { ok: true };
  }
}
