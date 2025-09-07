import { Global, Module } from '@nestjs/common';
import { TraceIdStore } from './trace-id.store';

@Global()
@Module({
  providers: [TraceIdStore],
  exports: [TraceIdStore],
})
export class TracingHttpModule {}
