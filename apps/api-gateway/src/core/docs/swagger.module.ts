import { INestApplication, Module } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

@Module({})
export class SwaggerModuleX {
  static setup(app: INestApplication) {
    const apiVersion = process.env.API_VERSION ?? '1.0.0';

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
