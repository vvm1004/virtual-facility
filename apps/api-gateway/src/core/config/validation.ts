import * as Joi from 'joi';

export function configValidation(config: Record<string, any>) {
  const schema = Joi.object({
    PORT: Joi.number().default(3000),
    CORS_ORIGIN: Joi.string().default('*'),
    API_VERSION: Joi.string().default('1.0.0'),
    NATS_URL: Joi.string().required(),
    RABBITMQ_URL: Joi.string().required(),
    BROKER_TIMEOUT_MS: Joi.number().default(3000),
    BROKER_RETRIES: Joi.number().default(1),
    CLASSIFY_CACHE_TTL: Joi.number().default(5000),
    IDEMPOTENCY_TTL_MS: Joi.number().default(600000),
    RATE_LIMIT: Joi.number().default(300),
    RATE_LIMIT_TTL: Joi.number().default(60000),
    REDIS_URL: Joi.string().required(),
  });
  const { error, value } = schema.validate(config, {
    allowUnknown: true,
    abortEarly: false,
  });
  if (error) throw error;
  return value;
}
