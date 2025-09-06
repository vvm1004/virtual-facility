import { ConsoleLogger, Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import * as microservices from '@nestjs/microservices';

@Injectable({ scope: Scope.REQUEST })
export class TracingLogger extends ConsoleLogger {
  constructor(
    @Inject(microservices.CONTEXT)
    private readonly ctx: microservices.RequestContext<
      unknown,
      microservices.NatsContext
    >,
    @Inject(INQUIRER) host: object,
  ) {
    const clsName = host?.constructor?.name;
    super(clsName);
  }

  protected formatContext(context: string): string {
    const msCtx: any = this.ctx?.getContext?.();
    let traceId: string | undefined;

    // NATS: getHeaders().get('traceId')
    if (msCtx?.getHeaders) {
      traceId = msCtx.getHeaders()?.get?.('traceId');
    }
    // RMQ: getMessage().properties.headers.traceId
    else if (msCtx?.getMessage) {
      traceId = msCtx.getMessage()?.properties?.headers?.traceId;
    }

    return (
      super.formatContext(context) + (traceId ? `[traceId: ${traceId}] ` : '')
    );
  }
}
