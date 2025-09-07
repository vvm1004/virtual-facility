import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigXService } from './config.service';
import { configValidation } from './validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: configValidation,
    }),
  ],
  providers: [ConfigXService],
  exports: [ConfigXService],
})
export class ConfigXModule {}
