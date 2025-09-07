import { Body, Controller, Post } from '@nestjs/common';
import { GatewayNatsProxy } from '../brokers/gateway-nats.proxy';
import { ack, ask } from '../brokers/rx';
import { ClassifyAlarmDto, CreateAlarmDto } from '@app/alarms';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Alarms')
@Controller('alarms')
export class AlarmsController {
  constructor(private readonly nats: GatewayNatsProxy) {}

  // request/response via NATS
  @Post('classify')
  @ApiBody({ type: ClassifyAlarmDto })
  async classify(@Body() dto: ClassifyAlarmDto) {
    const timeout = Number(process.env.BROKER_TIMEOUT_MS ?? 3000);
    const retries = Number(process.env.BROKER_RETRIES ?? 1);
    const res = await ask(
      this.nats.send('alarm.classify', dto),
      timeout,
      retries,
    );
    return res; // { category: 'critical'|'non-critical'|'invalid' }
  }

  // fire-and-forget via NATS
  @Post()
  async create(@Body() dto: CreateAlarmDto) {
    const timeout = Number(process.env.BROKER_TIMEOUT_MS ?? 3000);
    await ack(this.nats.emit('alarm.created', dto), timeout);
    return { ok: true };
  }
}
