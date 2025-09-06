import { Inject, Injectable, Scope } from '@nestjs/common';
import * as microservices from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { RABBITMQ_BROKER } from './constants';

@Injectable({ scope: Scope.REQUEST })
export class RabbitmqClientProxy {
  constructor(
    @Inject(RABBITMQ_BROKER) private readonly client: microservices.ClientProxy,
    @Inject(microservices.CONTEXT)
    private readonly ctx: microservices.RequestContext<
      unknown,
      microservices.RmqContext
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

    // Try NATS first
    let traceId: string | undefined = msCtx?.getHeaders?.()?.get?.('traceId');

    // Fallback RMQ
    if (!traceId) {
      traceId = msCtx?.getMessage?.()?.properties?.headers?.traceId;
    }

    // Fallback existing payload headers
    if (!traceId) {
      traceId = dataOrRecord?.options?.headers?.traceId;
    }

    const mergedHeaders = {
      ...(dataOrRecord?.options?.headers ?? {}),
      ...(traceId ? { traceId } : {}),
    };

    if (dataOrRecord instanceof microservices.RmqRecord) {
      return new microservices.RmqRecordBuilder(dataOrRecord.data)
        .setOptions({ ...(dataOrRecord.options ?? {}), headers: mergedHeaders })
        .build();
    }
    return new microservices.RmqRecordBuilder(dataOrRecord)
      .setOptions({ headers: mergedHeaders })
      .build();
  }
}
