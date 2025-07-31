import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application, Student, Job, Company } from '../../entities';
import { ExternalModule } from '../../external/external.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, Student, Job, Company]),
    ExternalModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}