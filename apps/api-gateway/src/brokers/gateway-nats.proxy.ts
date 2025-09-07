import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, NatsRecordBuilder } from '@nestjs/microservices';
import * as nats from 'nats';
import { Observable } from 'rxjs';
import { TraceIdStore } from '../tracing/trace-id.store';

export const GATEWAY_NATS = Symbol('GATEWAY_NATS');

@Injectable()
export class GatewayNatsProxy {
  constructor(
    @Inject(GATEWAY_NATS) private readonly client: ClientProxy,
    private readonly trace: TraceIdStore,
  ) {}

  send<T = any, I = any>(pattern: any, data: I): Observable<T> {
    const headers = nats.headers();
    const traceId = this.trace.get();
    if (traceId) headers.set('traceId', traceId);
    const record = new NatsRecordBuilder().setData(data).setHeaders(headers).build();
    return this.client.send(pattern, record);
  }

  emit<T = any, I = any>(pattern: any, data: I): Observable<T> {
    const headers = nats.headers();
    const traceId = this.trace.get();
    if (traceId) headers.set('traceId', traceId);
    const record = new NatsRecordBuilder().setData(data).setHeaders(headers).build();
    return this.client.emit(pattern, record);
  }
}
