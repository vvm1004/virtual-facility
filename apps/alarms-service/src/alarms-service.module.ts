import { Module } from '@nestjs/common';
import { AlarmsServiceController } from './alarms-service.controller';
import { AlarmsServiceService } from './alarms-service.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_MESSAGE_BROKER, NOTIFICATIONS_SERVICE } from './constants';
import { TracingModule } from '@app/tracing';
import { NatsClientModule } from '@app/tracing/nats-client/nats-client.module';
import { RabbitmqClientModule } from '@app/tracing/rabbitmq-client/rabbitmq-client.module';

@Module({
  imports: [NatsClientModule, RabbitmqClientModule, TracingModule],
  controllers: [AlarmsServiceController],
  providers: [AlarmsServiceService],
})
export class AlarmsServiceModule {}
