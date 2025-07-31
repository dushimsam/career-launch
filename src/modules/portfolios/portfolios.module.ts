import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfoliosController } from './portfolios.controller';
import { PortfoliosService } from './portfolios.service';
import { Portfolio } from '../../entities/portfolio.entity';
import { Project } from '../../entities/project.entity';
import { Student } from '../../entities/student.entity';
import { ExternalModule } from '../../external/external.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Portfolio, Project, Student]),
    ExternalModule,
  ],
  controllers: [PortfoliosController],
  providers: [PortfoliosService],
  exports: [PortfoliosService],
})
export class PortfoliosModule {}
