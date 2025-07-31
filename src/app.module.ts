import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from './configs/app-configs.module';
import { AppConfigService } from './configs/app-configs.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { AdminModule } from './modules/admin/admin.module';
import { PortfoliosModule } from './modules/portfolios/portfolios.module';
import { UniversitiesModule } from './modules/universities/universities.module';
import { ExternalModule } from './external/external.module';
import { entities } from './entities';

@Module({
  imports: [
    // Core configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AppConfigModule,
    
    // Database configuration
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (appConfigService: AppConfigService) => ({
        ...appConfigService.getPostgresInfo(),
        entities,
        synchronize: process.env.NODE_ENV === 'development', // Only in development
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.THROTTLE_TTL) || 60,
      limit: parseInt(process.env.THROTTLE_LIMIT) || 10,
    }]),
    
    // Application modules
    AuthModule,
    UsersModule,
    StudentsModule,
    CompaniesModule,
    JobsModule,
    ApplicationsModule,
    AdminModule,
    PortfoliosModule,
    UniversitiesModule,
    ExternalModule,
    
    // Legacy module (can be removed later)
    // FounderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
