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
import { JobsService } from './jobs.service';
import {
  CreateJobDto,
  UpdateJobDto,
  JobSearchDto,
  JobResponseDto,
} from './dto/job.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Search and filter jobs' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({ name: 'location', required: false, description: 'Job location' })
  @ApiQuery({ name: 'industry', required: false, description: 'Company industry' })
  @ApiQuery({ name: 'jobType', required: false, description: 'Job type' })
  @ApiQuery({ name: 'experienceLevel', required: false, description: 'Experience level required' })
  @ApiQuery({ name: 'isRemote', required: false, type: Boolean, description: 'Remote work option' })
  @ApiQuery({ name: 'skills', required: false, description: 'Required skills (comma-separated)' })
  @ApiQuery({ name: 'minSalary', required: false, type: Number, description: 'Minimum salary' })
  @ApiQuery({ name: 'maxSalary', required: false, type: Number, description: 'Maximum salary' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (ASC/DESC)' })
  @ApiResponse({
    status: 200,
    description: 'Jobs retrieved successfully',
  })
  async findAll(@Query() searchDto: JobSearchDto) {
    // Convert comma-separated skills to array
    if (searchDto.skills && typeof searchDto.skills === 'string') {
      searchDto.skills = (searchDto.skills as string).split(',').map(s => s.trim());
    }
    
    return this.jobsService.findAll(searchDto);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured jobs' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of featured jobs' })
  @ApiResponse({
    status: 200,
    description: 'Featured jobs retrieved successfully',
  })
  async getFeaturedJobs(
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit?: number
  ) {
    return this.jobsService.getFeaturedJobs(limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get job statistics' })
  @ApiResponse({
    status: 200,
    description: 'Job statistics retrieved successfully',
  })
  async getJobStats() {
    return this.jobsService.getJobStats();
  }

  @Get('recommendations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get job recommendations for student' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of recommendations' })
  @ApiResponse({
    status: 200,
    description: 'Job recommendations retrieved successfully',
  })
  async getJobRecommendations(
    @Request() req,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number
  ) {
    return this.jobsService.getJobRecommendations(req.user.userID, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiResponse({
    status: 200,
    description: 'Job found successfully',
    type: JobResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found',
  })
  async findById(@Param('id') jobID: string): Promise<JobResponseDto> {
    return this.jobsService.findById(jobID);
  }

  // Recruiter-only endpoints
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('recruiter')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new job posting (Recruiters only)' })
  @ApiResponse({
    status: 201,
    description: 'Job created successfully',
    type: JobResponseDto,
  })
  async create(
    @Body() createDto: CreateJobDto,
    @Request() req
  ): Promise<JobResponseDto> {
    return this.jobsService.create(createDto, req.user.userID);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update job posting (Recruiters only)' })
  @ApiResponse({
    status: 200,
    description: 'Job updated successfully',
    type: JobResponseDto,
  })
  async update(
    @Param('id') jobID: string,
    @Body() updateDto: UpdateJobDto,
    @Request() req
  ): Promise<JobResponseDto> {
    return this.jobsService.update(jobID, updateDto, req.user.userID);
  }

  @Put(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('recruiter')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish job posting (Recruiters only)' })
  @ApiResponse({
    status: 200,
    description: 'Job published successfully',
    type: JobResponseDto,
  })
  async publishJob(
    @Param('id') jobID: string,
    @Request() req
  ): Promise<JobResponseDto> {
    return this.jobsService.publishJob(jobID, req.user.userID);
  }

  @Put(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('recruiter')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close job posting (Recruiters only)' })
  @ApiResponse({
    status: 200,
    description: 'Job closed successfully',
    type: JobResponseDto,
  })
  async closeJob(
    @Param('id') jobID: string,
    @Request() req
  ): Promise<JobResponseDto> {
    return this.jobsService.closeJob(jobID, req.user.userID);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('recruiter')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete job posting (Recruiters only)' })
  @ApiResponse({
    status: 200,
    description: 'Job deleted successfully',
  })
  async deleteJob(
    @Param('id') jobID: string,
    @Request() req
  ) {
    return this.jobsService.deleteJob(jobID, req.user.userID);
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get job applications (Recruiters only)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by application status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Job applications retrieved successfully',
  })
  async getJobApplications(
    @Param('id') jobID: string,
    @Request() req,
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.jobsService.getJobApplications(jobID, req.user.userID, status, page, limit);
  }
}
