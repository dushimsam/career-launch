import { Module } from '@nestjs/common';
import { FounderController } from './founder.controller';
import { FounderService } from './founder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Founder } from './entity/founder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Founder])],
  controllers: [FounderController],
  providers: [FounderService],
})
export class FounderModule {}
