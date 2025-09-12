import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { ConfigXService } from '../../core/config/config.service';

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  constructor(
    @Inject('REDIS') private readonly redis: Redis,
    private readonly configService: ConfigXService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const key = req.header('Idempotency-Key');
    if (!key || req.method !== 'POST') return next();

    const ttlMs = this.configService.idempotencyTtlMs;
    const cacheKey = `idem:${key}`;
    const lockKey = `idem-lock:${key}`;

    // Check if there is a previous result
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        res.setHeader('Idempotency-Cache', 'HIT');
        if (parsed && typeof parsed.status === 'number')
          res.status(parsed.status);
        return res.json(parsed?.body ?? parsed);
      } catch {
        // Fallback if legacy/plain body was stored
        res.setHeader('Idempotency-Cache', 'HIT');
        return res.json(cached);
      }
    }

    // Set a lock to prevent concurrent processing of the same key
    const gotLock = await this.redis.set(lockKey, '1', 'PX', ttlMs, 'NX');
    if (!gotLock) {
      // Another request is processing this key → short polling for the result
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 150));
        const again = await this.redis.get(cacheKey);
        if (again) {
          res.setHeader('Idempotency-Cache', 'WAIT-HIT');
          return res.json(JSON.parse(again));
        }
      }
      // Out of patience
      return res.status(409).json({ error: 'Idempotency in progress' });
    }

    // Override res.json to save results to Redis
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // Save to Redis asynchronously without blocking the response
      this.redis
        .set(cacheKey, JSON.stringify(body), 'PX', ttlMs)
        .finally(() => this.redis.del(lockKey));
      return originalJson(body);
    };

    next();
  }
}
