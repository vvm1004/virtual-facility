import { Inject, Injectable, Scope } from '@nestjs/common';
import * as microservices from '@nestjs/microservices';
import { NATS_BROKER } from './constants';
import * as nats from 'nats';
import { Observable } from 'rxjs';

@Injectable({ scope: Scope.REQUEST })
export class NatsClientProxy {
  constructor(
    @Inject(NATS_BROKER) private readonly client: microservices.ClientProxy,
    @Inject(microservices.CONTEXT)
    private readonly ctx: microservices.RequestContext<
      unknown,
      microservices.NatsContext
    >,
  ) {}

  send<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
  ): Observable<TResult> {
    return this.client.send(pattern, this.setTraceId(data));
  }

  emit<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
  ): Observable<TResult> {
    return this.client.emit(pattern, this.setTraceId(data));
  }

  private setTraceId(dataOrRecord: any) {
    const msCtx: any = this.ctx?.getContext?.();
    // NATS
    let traceId = msCtx?.getHeaders?.()?.get?.('traceId');
    // Fallback RMQ
    if (!traceId) traceId = msCtx?.getMessage?.()?.properties?.headers?.traceId;

    const headers = dataOrRecord?.headers ?? nats.headers();
    if (traceId) headers.set('traceId', traceId);

    if (dataOrRecord instanceof microservices.NatsRecord) {
      return new microservices.NatsRecordBuilder(dataOrRecord.data)
        .setHeaders(headers)
        .build();
    }
    return new microservices.NatsRecordBuilder()
      .setData(dataOrRecord)
      .setHeaders(headers)
      .build();
  }
}
