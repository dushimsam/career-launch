import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Job } from '../../entities/job.entity';
import { Company } from '../../entities/company.entity';
import { Recruiter } from '../../entities/recruiter.entity';
import { Application } from '../../entities/application.entity';
import { Student } from '../../entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, Company, Recruiter, Application, Student]),
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
