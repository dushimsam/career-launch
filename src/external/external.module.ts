import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { GitHubService } from './github.service';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, GitHubService],
  exports: [EmailService, GitHubService],
})
export class ExternalModule {}
