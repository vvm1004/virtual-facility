import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GatewayNatsProxy, GATEWAY_NATS } from './gateway-nats.proxy';
import { GatewayRabbitmqProxy, GATEWAY_RMQ } from './gateway-rabbitmq.proxy';
import { TracingHttpModule } from '../tracing/tracing.module';
import { ConfigXService } from '../core/config/config.service';

@Module({
  imports: [
    TracingHttpModule,
    ClientsModule.registerAsync([
      {
        name: GATEWAY_NATS,
        useFactory: (configService: ConfigXService) => ({
          transport: Transport.NATS,
          options: { servers: configService.natsUrl },
        }),
        inject: [ConfigXService],
      },
      {
        name: GATEWAY_RMQ,
        useFactory: (configService: ConfigXService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.rabbitUrl],
            queue: 'notifications-service',
          },
        }),
        inject: [ConfigXService],
      },
    ]),
  ],
  providers: [GatewayNatsProxy, GatewayRabbitmqProxy],
  exports: [GatewayNatsProxy, GatewayRabbitmqProxy],
})
export class BrokersModule {}
