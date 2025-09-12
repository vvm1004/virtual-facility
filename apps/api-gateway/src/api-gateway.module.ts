import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BrokersModule } from './brokers/brokers.module';
import { TracingHttpModule } from './tracing/tracing.module';
import { TraceIdMiddleware } from './tracing/trace-id.middleware';
import { SecurityModule } from './core/security/security.module';
import { ObservabilityModule } from './core/observability/observability.module';
import { SwaggerModuleX } from './core/docs/swagger.module';
import { ConfigXModule } from './core/config/config.module';
import { AlarmsController } from './routes/alarms.controller';
import { HealthController } from './health/health.controller';
import { BuildingsGatewayController } from './routes/buildings.controller';
import { HttpModule } from '@nestjs/axios';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { RedisModule } from './core/redis/redis.module';

@Module({
  imports: [
    ConfigXModule,
    SecurityModule,
    ObservabilityModule,
    SwaggerModuleX,
    TracingHttpModule,
    BrokersModule,
    HttpModule.register({ timeout: 5000 }),
    RedisModule,
  ],
  controllers: [
    HealthController,
    AlarmsController,
    BuildingsGatewayController,
    ApiGatewayController,
  ],
  providers: [ApiGatewayService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceIdMiddleware).forRoutes('*');
  }
}
