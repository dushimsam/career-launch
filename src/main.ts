// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { enableAppConfig } from './configs/app.configs';
import { AppConfigService } from './configs/app-configs.service';
import { APP_NAME } from './common/constants/all-constants';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { port, environment } = app.get(AppConfigService);

  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: '*',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API versioning
  app.setGlobalPrefix('api/v1');

  // Swagger API documentation
  if (environment === 'development') {
    const config = new DocumentBuilder()
      .setTitle('CareerLaunch API')
      .setDescription('Comprehensive skill-based recruitment platform API connecting African graduates with employers')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Authentication', 'User authentication and authorization')
      .addTag('Users', 'User management and profiles')
      .addTag('Students', 'Student-specific operations')
      .addTag('Companies', 'Company management')
      .addTag('Jobs', 'Job postings and management')
      .addTag('Applications', 'Job applications')
      .addTag('Universities', 'University management')
      .addTag('Portfolios', 'Portfolio and project management')
      .addTag('Admin', 'Administrative operations')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'CareerLaunch API Documentation',
      customfavIcon: '/favicon.ico',
      customCss: '.swagger-ui .topbar { display: none }',
    });

    console.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
  }

  await enableAppConfig(app);

  await app.listen(port, () => {
    console.warn(
      `🚀 ${APP_NAME} is running on port => ${port} in ${environment} mode`
    );
    console.warn(`🌐 API Base URL: http://localhost:${port}/api/v1`);
    if (environment === 'development') {
      console.warn(`📖 Swagger Docs: http://localhost:${port}/api/docs`);
    }
  });
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start the application:', error);
  process.exit(1);
});
