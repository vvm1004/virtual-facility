import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export interface TraceableRequest extends Request {
  traceId?: string;
}

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: TraceableRequest, _res: Response, next: NextFunction) {
    const incoming = req.header('x-trace-id');
    req.traceId = incoming ?? randomUUID();
    next();
  }
}
