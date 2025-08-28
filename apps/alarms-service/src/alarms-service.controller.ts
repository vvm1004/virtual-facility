import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { EventPattern, Payload, ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { NATS_MESSAGE_BROKER, NOTIFICATIONS_SERVICE } from './constants';

@Controller()
export class AlarmsServiceController {
  private readonly logger = new Logger(AlarmsServiceController.name);

  constructor(
    @Inject(NATS_MESSAGE_BROKER)
    private readonly natsMessageBroker: ClientProxy,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: ClientProxy,
  ) {}

  @EventPattern('alarm.created')
  async create(@Payload() data: unknown) {
    this.logger.debug(
      `Received new "alarm.created" event: ${JSON.stringify(data)}`,
    );

    // If we decided to use the choreography pattern instead, we would simply emit an event here and let other services handle the rest.
    //
    // So for example:
    // 1. "Alarms service" would emit an event to the "Alarm classifier service" to classify the alarm.
    // 2. "Alarm classifier service" would classify the alarm and emit an event to the "Notifications service" to notify other services about the alarm.
    // 3. "Notifications service" would subscribe to the "alarm.classified" event and notify other services about the alarm.
    const alarmClassification = await lastValueFrom(
      this.natsMessageBroker.send('alarm.classify', data),
    );
    const alarmData = data as { name: string };
    this.logger.debug(
      `Alarm "${alarmData.name}" classified as ${alarmClassification.category}`,
    );

    const notify$ = this.notificationsService.emit('notification.send', {
      alarm: data,
      category: alarmClassification.category,
    });
    await lastValueFrom(notify$);
    this.logger.debug(`Dispatched "notification.send" event`);
  }
}
