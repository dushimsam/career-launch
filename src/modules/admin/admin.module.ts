import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import {
  User,
  Student,
  Recruiter,
  Company,
  Job,
  Application,
  University,
  PlatformAdmin,
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Student,
      Recruiter,
      Company,
      Job,
      Application,
      University,
      PlatformAdmin,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}