import { Controller, Get, Logger } from '@nestjs/common';
import { AlarmsServiceService } from './alarms-service.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AlarmsServiceController {
  private readonly logger = new Logger(AlarmsServiceController.name);
  @EventPattern('alarm.created')
  async create(@Payload() data: unknown) {
    this.logger.debug(
      `Received new "alarm.created" event: ${JSON.stringify(data)}`,
    );
  }
}
