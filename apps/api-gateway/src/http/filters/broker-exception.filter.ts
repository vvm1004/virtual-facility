import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class BrokerExceptionFilter implements ExceptionFilter {
  catch(err: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    if (res.headersSent) {
      return;
    }
    if (err?.message === 'UPSTREAM_TIMEOUT') {
      return res.status(504).json({ error: 'Gateway Timeout' });
    }
    if (err?.code === 'ECONNREFUSED' || err?.code === 'ECONNRESET') {
      return res.status(502).json({ error: 'Bad Gateway' });
    }
    if (err?.response?.statusCode && err?.response?.message) {
      // Forward Nest-style exceptions if needed (e.g., ValidationError)
      return res.status(err.response.statusCode).json({
        error: err.response.message,
      });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
