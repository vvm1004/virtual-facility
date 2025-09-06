import { Module } from '@nestjs/common';
import { TracingService } from './tracing.service';
import { TracingLogger } from './tracing.logger';
import { NatsClientModule } from './nats-client/nats-client.module';
import { RabbitmqClientModule } from './rabbitmq-client/rabbitmq-client.module';

@Module({
  providers: [TracingService, TracingLogger],
  exports: [TracingService, TracingLogger],
  imports: [NatsClientModule, RabbitmqClientModule],
})
export class TracingModule {}
