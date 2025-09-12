import { INestApplication, Module } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigXService } from '../config/config.service';

@Module({})
export class SwaggerModuleX {
  static setup(app: INestApplication) {
    const configService = app.get(ConfigXService);
    const apiVersion = configService.apiVersion;

    const config = new DocumentBuilder()
      .setTitle('Virtual Facility API Gateway')
      .setDescription('Gateway for alarms, buildings, workflows')
      .setVersion(apiVersion)
      // .addServer('/v1', 'Version 1')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
    });

    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
      customSiteTitle: 'Virtual Facility API Docs',
    });
  }
}
