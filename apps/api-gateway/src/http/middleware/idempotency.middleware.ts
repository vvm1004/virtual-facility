import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Demo conly use Map in-memory. Production should use Redis.
 */
const memory = new Map<string, any>();

export class IdempotencyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const key = req.header('Idempotency-Key');
    if (!key) return next();

    if (memory.has(key)) {
      return res.json(memory.get(key));
    }

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      memory.set(key, body);
      return originalJson(body);
    };

    next();
  }
}
