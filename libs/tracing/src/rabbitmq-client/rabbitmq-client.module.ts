import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RABBITMQ_BROKER } from './constants';
import { RabbitmqClientProxy } from './rabbitmq-client.proxy';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: RABBITMQ_BROKER,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL!],
          queue: 'notifications-service',
        },
      },
    ]),
  ],
  providers: [RabbitmqClientProxy],
  exports: [RabbitmqClientProxy],
})
export class RabbitmqClientModule {}
