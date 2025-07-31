import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Staging = 'staging',
  Test = 'test',
  Local = 'local',
}

@Exclude()
export class EnvironmentVariables {
  @Expose()
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @Expose()
  @IsNumber()
  APP_PORT: number;

  // Database Configuration
  @Expose()
  @IsString()
  DB_HOST: string;

  @Expose()
  @IsNumber()
  DB_PORT: number;

  @Expose()
  @IsString()
  DB_USER: string;

  @Expose()
  @IsString()
  DB_PASS: string;

  @Expose()
  @IsString()
  DB_NAME: string;

  // JWT Configuration
  @Expose()
  @IsString()
  JWT_SECRET: string;

  @Expose()
  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string;

  @Expose()
  @IsOptional()
  @IsString()
  JWT_REFRESH_SECRET?: string;

  @Expose()
  @IsOptional()
  @IsString()
  JWT_REFRESH_EXPIRES_IN?: string;

  // Frontend Configuration
  @Expose()
  @IsOptional()
  @IsString()
  FRONTEND_URL?: string;

  // Email Configuration
  @Expose()
  @IsOptional()
  @IsString()
  SMTP_HOST?: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  SMTP_PORT?: number;

  @Expose()
  @IsOptional()
  @IsString()
  SMTP_SECURE?: string;

  @Expose()
  @IsOptional()
  @IsString()
  SMTP_USER?: string;

  @Expose()
  @IsOptional()
  @IsString()
  SMTP_PASS?: string;

  @Expose()
  @IsOptional()
  @IsString()
  FROM_EMAIL?: string;

  // Twilio Configuration
  @Expose()
  @IsOptional()
  @IsString()
  TWILIO_ACCOUNT_SID?: string;

  @Expose()
  @IsOptional()
  @IsString()
  TWILIO_AUTH_TOKEN?: string;

  @Expose()
  @IsOptional()
  @IsString()
  TWILIO_PHONE_NUMBER?: string;

  // GitHub OAuth Configuration
  @Expose()
  @IsOptional()
  @IsString()
  GITHUB_CLIENT_ID?: string;

  @Expose()
  @IsOptional()
  @IsString()
  GITHUB_CLIENT_SECRET?: string;

  @Expose()
  @IsOptional()
  @IsString()
  GITHUB_CALLBACK_URL?: string;

  // Redis Configuration
  @Expose()
  @IsOptional()
  @IsString()
  REDIS_HOST?: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  REDIS_PORT?: number;

  @Expose()
  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  // File Upload Configuration
  @Expose()
  @IsOptional()
  @IsNumber()
  MAX_FILE_SIZE?: number;

  @Expose()
  @IsOptional()
  @IsString()
  UPLOAD_DEST?: string;

  // Rate Limiting Configuration
  @Expose()
  @IsOptional()
  @IsNumber()
  THROTTLE_TTL?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  THROTTLE_LIMIT?: number;
}
