import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import type { Response } from 'express';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly limiter: RateLimiterRedis) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { ip?: string }>();
    const res = ctx.switchToHttp().getResponse<Response>();

    const key =
      (req.headers['x-forwarded-for'] as string) ||
      (req as any).ip ||
      ((req as any).socket && (req as any).socket.remoteAddress) ||
      'unknown';

    try {
      await this.limiter.consume(key, 1); // consume 1 point
      return true;
    } catch (e: any) {
      const ms = Math.ceil((e?.msBeforeNext ?? 1000) / 1000);
      res.setHeader('Retry-After', String(ms));
      res.status(429).json({ error: 'Too Many Requests' });
      return false;
    }
  }
}
