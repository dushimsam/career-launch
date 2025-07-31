import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Company } from '../../entities/company.entity';
import { Recruiter } from '../../entities/recruiter.entity';
import { Job } from '../../entities/job.entity';
import { Application } from '../../entities/application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Recruiter, Job, Application]),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
