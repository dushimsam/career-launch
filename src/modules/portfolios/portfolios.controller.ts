import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PortfoliosService } from './portfolios.service';
import {
  CreatePortfolioDto,
  UpdatePortfolioDto,
  CreateProjectDto,
  UpdateProjectDto,
  PortfolioResponseDto,
  ProjectResponseDto,
  SyncPortfolioDto,
} from './dto/portfolio.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PortfolioType } from '../../common/enums/user-status.enum';

@ApiTags('Portfolios')
@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Get('featured')
  @ApiOperation({ summary: 'Get featured portfolios' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of featured portfolios' })
  @ApiResponse({
    status: 200,
    description: 'Featured portfolios retrieved successfully',
  })
  async getFeaturedPortfolios(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number
  ) {
    return this.portfoliosService.getFeaturedPortfolios(limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search portfolios' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({ name: 'platform', required: false, enum: PortfolioType, description: 'Portfolio platform' })
  @ApiQuery({ name: 'technologies', required: false, description: 'Technologies (comma-separated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Portfolios found successfully',
  })
  async searchPortfolios(
    @Query('q') query?: string,
    @Query('platform') platform?: PortfolioType,
    @Query('technologies') technologies?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    const techArray = technologies ? technologies.split(',').map(t => t.trim()) : undefined;
    return this.portfoliosService.searchPortfolios(query, platform, techArray, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get portfolio by ID' })
  @ApiResponse({
    status: 200,
    description: 'Portfolio found successfully',
    type: PortfolioResponseDto,
  })
  async getPortfolioById(@Param('id') portfolioID: string): Promise<PortfolioResponseDto> {
    return this.portfoliosService.getPortfolioById(portfolioID);
  }

  @Get(':id/projects')
  @ApiOperation({ summary: 'Get portfolio projects' })
  @ApiResponse({
    status: 200,
    description: 'Portfolio projects retrieved successfully',
  })
  async getPortfolioProjects(@Param('id') portfolioID: string) {
    return this.portfoliosService.getPortfolioProjects(portfolioID);
  }

  // Student-only endpoints
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create portfolio (Students only)' })
  @ApiResponse({
    status: 201,
    description: 'Portfolio created successfully',
    type: PortfolioResponseDto,
  })
  async createPortfolio(
    @Body() createDto: CreatePortfolioDto,
    @Request() req
  ): Promise<PortfolioResponseDto> {
    return this.portfoliosService.createPortfolio(req.user.userID, createDto);
  }

  @Get('my/portfolios')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my portfolios (Students only)' })
  @ApiResponse({
    status: 200,
    description: 'Student portfolios retrieved successfully',
  })
  async getMyPortfolios(@Request() req) {
    return this.portfoliosService.getStudentPortfolios(req.user.userID);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update portfolio (Students only)' })
  @ApiResponse({
    status: 200,
    description: 'Portfolio updated successfully',
    type: PortfolioResponseDto,
  })
  async updatePortfolio(
    @Param('id') portfolioID: string,
    @Body() updateDto: UpdatePortfolioDto,
    @Request() req
  ): Promise<PortfolioResponseDto> {
    return this.portfoliosService.updatePortfolio(portfolioID, req.user.userID, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete portfolio (Students only)' })
  @ApiResponse({
    status: 200,
    description: 'Portfolio deleted successfully',
  })
  async deletePortfolio(
    @Param('id') portfolioID: string,
    @Request() req
  ) {
    return this.portfoliosService.deletePortfolio(portfolioID, req.user.userID);
  }

  @Post(':id/sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync portfolio with external platform (Students only)' })
  @ApiResponse({
    status: 200,
    description: 'Portfolio synced successfully',
  })
  async syncPortfolio(
    @Param('id') portfolioID: string,
    @Body() syncDto: SyncPortfolioDto,
    @Request() req
  ) {
    return this.portfoliosService.syncPortfolio(portfolioID, req.user.userID, syncDto);
  }

  @Post(':id/projects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add project to portfolio (Students only)' })
  @ApiResponse({
    status: 201,
    description: 'Project added successfully',
    type: ProjectResponseDto,
  })
  async createProject(
    @Param('id') portfolioID: string,
    @Body() createDto: CreateProjectDto,
    @Request() req
  ): Promise<ProjectResponseDto> {
    return this.portfoliosService.createProject(portfolioID, req.user.userID, createDto);
  }

  @Put('projects/:projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update project (Students only)' })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: ProjectResponseDto,
  })
  async updateProject(
    @Param('projectId') projectID: string,
    @Body() updateDto: UpdateProjectDto,
    @Request() req
  ): Promise<ProjectResponseDto> {
    return this.portfoliosService.updateProject(projectID, req.user.userID, updateDto);
  }

  @Delete('projects/:projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete project (Students only)' })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
  })
  async deleteProject(
    @Param('projectId') projectID: string,
    @Request() req
  ) {
    return this.portfoliosService.deleteProject(projectID, req.user.userID);
  }
}
