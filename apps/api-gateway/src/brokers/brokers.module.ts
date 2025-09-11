import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GatewayNatsProxy, GATEWAY_NATS } from './gateway-nats.proxy';
import { GatewayRabbitmqProxy, GATEWAY_RMQ } from './gateway-rabbitmq.proxy';
import { TracingHttpModule } from '../tracing/tracing.module';

@Module({
  imports: [
    TracingHttpModule,
    ClientsModule.register([
      {
        name: GATEWAY_NATS,
        transport: Transport.NATS,
        options: { servers: process.env.NATS_URL },
      },
      {
        name: GATEWAY_RMQ,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL!],
          queue: 'notifications-service',
        },
      },
    ]),
  ],
  providers: [GatewayNatsProxy, GatewayRabbitmqProxy],
  exports: [GatewayNatsProxy, GatewayRabbitmqProxy],
})
export class BrokersModule {}
