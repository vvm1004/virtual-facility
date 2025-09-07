import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import helmet from 'helmet';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { BrokerExceptionFilter } from './http/filters/broker-exception.filter';
import { SwaggerModuleX } from './core/docs/swagger.module';
import { MetricsMiddleware } from './core/observability/metrics.middleware';
import { AppModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Security & body size
  app.use(helmet());
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true });
  app.use(json({ limit: '1mb' }));

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  // Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Error mapping (broker → HTTP)
  app.useGlobalFilters(new BrokerExceptionFilter());

  // Metrics
  app.use(new MetricsMiddleware().use);

  // Swagger
  SwaggerModuleX.setup(app);

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap();
