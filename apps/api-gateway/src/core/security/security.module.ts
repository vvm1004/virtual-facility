import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { RateLimitGuard } from './rate-limit.guard';

@Module({
  providers: [
    {
      provide: 'RATE_LIMITER',
      useFactory: () =>
        new RateLimiterRedis({
          storeClient: new Redis(process.env.REDIS_URL!),
          points: Number(process.env.RATE_LIMIT ?? 300), // max requests
          duration: Math.ceil(
            Number(process.env.RATE_LIMIT_TTL ?? 60000) / 1000,
          ), // per seconds
          execEvenly: false,
          keyPrefix: 'rl:',
        }),
    },
    {
      provide: APP_GUARD,
      useFactory: (limiter: RateLimiterRedis) => new RateLimitGuard(limiter),
      inject: ['RATE_LIMITER'],
    },
  ],
})
export class SecurityModule {}
