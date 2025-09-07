import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { TraceableRequest } from './trace-id.middleware';

@Injectable({ scope: Scope.REQUEST })
export class TraceIdStore {
  constructor(@Inject(REQUEST) private readonly req: TraceableRequest) {}
  get(): string | undefined {
    return this.req.traceId;
  }
}
