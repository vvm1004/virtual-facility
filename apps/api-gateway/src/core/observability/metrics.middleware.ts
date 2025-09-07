import { Request, Response, NextFunction } from 'express';

export class MetricsMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const ms = Number(end - start) / 1_000_000;
      // Hook metrics system here (Prometheus, etc.)
      // console.log(`[metrics] ${req.method} ${req.originalUrl} -> ${res.statusCode} in ${ms.toFixed(1)}ms`);
    });
    next();
  }
}
