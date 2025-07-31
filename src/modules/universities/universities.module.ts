import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniversitiesController } from './universities.controller';
import { UniversitiesService } from './universities.service';
import { University } from '../../entities/university.entity';
import { Student } from '../../entities/student.entity';
import { UniversityAdmin } from '../../entities/university-admin.entity';
import { Application } from '../../entities/application.entity';
import { Job } from '../../entities/job.entity';
import { ExternalModule } from '../../external/external.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([University, Student, UniversityAdmin, Application, Job]),
    ExternalModule,
  ],
  controllers: [UniversitiesController],
  providers: [UniversitiesService],
  exports: [UniversitiesService],
})
export class UniversitiesModule {}
