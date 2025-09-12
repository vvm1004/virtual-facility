import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigXService {
  constructor(private readonly cfg: ConfigService) {}

  // Server Configuration
  get port(): number {
    return this.cfg.get<number>('PORT', 3000);
  }

  get corsOrigin(): string {
    return this.cfg.get<string>('CORS_ORIGIN', '*');
  }

  get apiVersion(): string {
    return this.cfg.get<string>('API_VERSION', '1.0.0');
  }

  // Broker Configuration
  get natsUrl(): string {
    return this.cfg.getOrThrow<string>('NATS_URL');
  }

  get rabbitUrl(): string {
    return this.cfg.getOrThrow<string>('RABBITMQ_URL');
  }

  get brokerTimeoutMs(): number {
    return this.cfg.get<number>('BROKER_TIMEOUT_MS', 3000);
  }

  get brokerRetries(): number {
    return this.cfg.get<number>('BROKER_RETRIES', 1);
  }

  // Cache Configuration
  get classifyCacheTtl(): number {
    return this.cfg.get<number>('CLASSIFY_CACHE_TTL', 5000);
  }

  get idempotencyTtlMs(): number {
    return this.cfg.get<number>('IDEMPOTENCY_TTL_MS', 600000);
  }

  // Rate Limiting Configuration
  get rateLimit(): number {
    return this.cfg.get<number>('RATE_LIMIT', 300);
  }

  get rateLimitTtl(): number {
    return this.cfg.get<number>('RATE_LIMIT_TTL', 60000);
  }

  // Redis Configuration
  get redisUrl(): string {
    return this.cfg.getOrThrow<string>('REDIS_URL');
  }
}
