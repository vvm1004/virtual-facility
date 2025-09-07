import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigXService {
  constructor(private readonly cfg: ConfigService) {}

  get natsUrl(): string { return this.cfg.get<string>('NATS_URL')!; }
  get rabbitUrl(): string { return this.cfg.get<string>('RABBITMQ_URL')!; }
  get brokerTimeoutMs(): number { return Number(this.cfg.get<number>('BROKER_TIMEOUT_MS') ?? 3000); }
  get brokerRetries(): number { return Number(this.cfg.get<number>('BROKER_RETRIES') ?? 1); }
}
