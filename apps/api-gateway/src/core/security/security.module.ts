import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { RateLimitGuard } from './rate-limit.guard';
import { ConfigXService } from '../config/config.service';

@Module({
  providers: [
    {
      provide: 'RATE_LIMITER',
      useFactory: (configService: ConfigXService) =>
        new RateLimiterRedis({
          storeClient: new Redis(configService.redisUrl),
          points: configService.rateLimit, // max requests
          duration: Math.ceil(configService.rateLimitTtl / 1000), // per seconds
          execEvenly: false,
          keyPrefix: 'rl:',
        }),
      inject: [ConfigXService],
    },
    {
      provide: APP_GUARD,
      useFactory: (limiter: RateLimiterRedis) => new RateLimitGuard(limiter),
      inject: ['RATE_LIMITER'],
    },
  ],
})
export class SecurityModule {}
