import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment, EnvironmentVariables } from './dto/env-variables.dto';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  get port(): number {
    return this.configService.get('APP_PORT');
  }

  get environment(): string {
    return this.configService.get('NODE_ENV');
  }

  get dbHost(): string {
    return this.configService.get('DB_HOST');
  }

  get dbPort(): number {
    return this.configService.get('DB_PORT');
  }

  get dbUser(): string {
    return this.configService.get('DB_USER');
  }

  get dbPass(): string {
    return this.configService.get('DB_PASS');
  }

  get dbName(): string {
    return this.configService.get('DB_NAME');
  }

  // JWT Configuration
  get jwtSecret(): string {
    return this.configService.get('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.configService.get('JWT_EXPIRES_IN', '1h');
  }

  get jwtRefreshSecret(): string {
    return this.configService.get('JWT_REFRESH_SECRET');
  }

  get jwtRefreshExpiresIn(): string {
    return this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d');
  }

  // Frontend Configuration
  get frontendUrl(): string {
    return this.configService.get('FRONTEND_URL', 'http://localhost:3000');
  }

  // Email Configuration
  get smtpHost(): string {
    return this.configService.get('SMTP_HOST');
  }

  get smtpPort(): number {
    return this.configService.get('SMTP_PORT', 587);
  }

  get smtpSecure(): boolean {
    return this.configService.get('SMTP_SECURE', 'false') === 'true';
  }

  get smtpUser(): string {
    return this.configService.get('SMTP_USER');
  }

  get smtpPass(): string {
    return this.configService.get('SMTP_PASS');
  }

  get fromEmail(): string {
    return this.configService.get('FROM_EMAIL');
  }

  // Twilio Configuration
  get twilioAccountSid(): string {
    return this.configService.get('TWILIO_ACCOUNT_SID');
  }

  get twilioAuthToken(): string {
    return this.configService.get('TWILIO_AUTH_TOKEN');
  }

  get twilioPhoneNumber(): string {
    return this.configService.get('TWILIO_PHONE_NUMBER');
  }

  // GitHub OAuth Configuration
  get githubClientId(): string {
    return this.configService.get('GITHUB_CLIENT_ID');
  }

  get githubClientSecret(): string {
    return this.configService.get('GITHUB_CLIENT_SECRET');
  }

  get githubCallbackUrl(): string {
    return this.configService.get('GITHUB_CALLBACK_URL', 'http://localhost:7700/auth/github/callback');
  }

  // Redis Configuration
  get redisHost(): string {
    return this.configService.get('REDIS_HOST', 'localhost');
  }

  get redisPort(): number {
    return this.configService.get('REDIS_PORT', 6379);
  }

  get redisPassword(): string {
    return this.configService.get('REDIS_PASSWORD', '');
  }

  // File Upload Configuration
  get maxFileSize(): number {
    return this.configService.get('MAX_FILE_SIZE', 5242880); // 5MB
  }

  get uploadDest(): string {
    return this.configService.get('UPLOAD_DEST', './uploads');
  }

  // Rate Limiting Configuration
  get throttleTtl(): number {
    return this.configService.get('THROTTLE_TTL', 60);
  }

  get throttleLimit(): number {
    return this.configService.get('THROTTLE_LIMIT', 10);
  }

  getPostgresInfo(): TypeOrmModuleOptions {
    return {
      name: 'default',
      type: 'postgres',
      host: this.dbHost,
      port: this.dbPort,
      username: this.dbUser,
      password: this.dbPass,
      database: this.dbName,
      migrations: ['dist/db/migrations/**/*.js'],
      entities: ['dist/**/*.entity.js'],
      synchronize: this.environment !== Environment.Production,
      migrationsRun: this.environment === Environment.Production,
      dropSchema: false,
      cache: false,
      logging: false,
    };
  }
}
