import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { TraceIdStore } from '../tracing/trace-id.store';

export const GATEWAY_RMQ = Symbol('GATEWAY_RMQ');

@Injectable()
export class GatewayRabbitmqProxy {
  constructor(
    @Inject(GATEWAY_RMQ) private readonly client: ClientProxy,
    private readonly trace: TraceIdStore,
  ) {}

  send<T = any, I = any>(pattern: any, data: I): Observable<T> {
    const traceId = this.trace.get();
    const record = new RmqRecordBuilder(data)
      .setOptions({ headers: traceId ? { traceId } : {} })
      .build();
    return this.client.send(pattern, record);
  }

  emit<T = any, I = any>(pattern: any, data: I): Observable<T> {
    const traceId = this.trace.get();
    const record = new RmqRecordBuilder(data)
      .setOptions({ headers: traceId ? { traceId } : {} })
      .build();
    return this.client.emit(pattern, record);
  }
}
