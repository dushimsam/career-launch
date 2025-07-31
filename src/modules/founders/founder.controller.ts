import { Controller, Get, Post } from '@nestjs/common';
import { ApiBadGatewayResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FounderService } from './founder.service';
import { _errors } from 'src/common/helpers/common.helpers';
import { _400 } from 'src/common/constants/error-const';

@Controller('founder')
@ApiTags('founder')
export class FounderController {
  constructor(private readonly founderService: FounderService) {}

  @Get()
  getHello(): string {
    return this.founderService.getHello();
  }

  @ApiOperation({ summary: 'Load founders, if they are not in database' })
  @ApiBadGatewayResponse(_errors([_400.FOUNDERS_ALREADY_EXISTS]))
  @Post('load')
  async loadFounders() {
    return this.founderService.loadFounders();
  }

  @Get('all')
  async getFounders() {
    return this.founderService.getFounders();
  }
}
