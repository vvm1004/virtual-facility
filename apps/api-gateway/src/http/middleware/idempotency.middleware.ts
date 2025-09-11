import { Inject, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const TTL_MS = Number(process.env.IDEMPOTENCY_TTL_MS ?? 10 * 60_000); // 10 minutes

export class IdempotencyMiddleware implements NestMiddleware {
  constructor(@Inject('REDIS') private readonly redis: Redis) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const key = req.header('Idempotency-Key');
    if (!key || req.method !== 'POST') return next();

    const cacheKey = `idem:${key}`;
    const lockKey = `idem-lock:${key}`;

    // Check if there is a previous result
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      res.setHeader('Idempotency-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }

    // Set a lock to prevent concurrent processing of the same key
    const gotLock = await this.redis.set(lockKey, '1', 'PX', TTL_MS, 'NX');
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
        .set(cacheKey, JSON.stringify(body), 'PX', TTL_MS)
        .finally(() => this.redis.del(lockKey));
      return originalJson(body);
    };

    next();
  }
}
