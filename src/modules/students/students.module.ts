import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student } from '../../entities/student.entity';
import { Portfolio } from '../../entities/portfolio.entity';
import { Application } from '../../entities/application.entity';
import { Job } from '../../entities/job.entity';
import { ExternalModule } from '../../external/external.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Portfolio, Application, Job]),
    ExternalModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
