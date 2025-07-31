import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import {
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  ApplicationResponseDto,
  ApplicationSearchDto,
} from './dto/application.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApplicationStatus } from 'src/common/enums/user-status.enum';

@ApiTags('Applications')
@Controller('applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a job application (Students only)' })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully',
    type: ApplicationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors or already applied',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found',
  })
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
    @Request() req,
  ): Promise<ApplicationResponseDto> {
    return this.applicationsService.create(req.user.userID, createApplicationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get applications (filtered by user role)' })
  @ApiResponse({
    status: 200,
    description: 'Applications retrieved successfully',
    type: [ApplicationResponseDto],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['submitted', 'under_review', 'shortlisted', 'interviewed', 'accepted', 'rejected', 'withdrawn'] })
  @ApiQuery({ name: 'jobID', required: false, type: String })
  @ApiQuery({ name: 'studentID', required: false, type: String })
  @ApiQuery({ name: 'companyID', required: false, type: String })
  async findAll(
    @Query() searchDto: ApplicationSearchDto,
    @Request() req,
  ): Promise<{ applications: ApplicationResponseDto[]; total: number }> {
    return this.applicationsService.findAll(searchDto, req.user.type, req.user.userID);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get application statistics' })
  @ApiResponse({
    status: 200,
    description: 'Application statistics retrieved successfully',
  })
  async getStats(@Request() req): Promise<{
    total: number;
    byStatus: Record<string, number>;
    recentApplications: number;
  }> {
    return this.applicationsService.getApplicationStats(req.user.type, req.user.userID);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific application' })
  @ApiResponse({
    status: 200,
    description: 'Application retrieved successfully',
    type: ApplicationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Application not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<ApplicationResponseDto> {
    return this.applicationsService.findOne(id, req.user.type, req.user.userID);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update application status (Recruiters and Admins only)' })
  @ApiResponse({
    status: 200,
    description: 'Application status updated successfully',
    type: ApplicationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Application not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
    @Request() req,
  ): Promise<ApplicationResponseDto> {
    return this.applicationsService.updateStatus(id, updateStatusDto, req.user.userID);
  }

  @Delete(':id/withdraw')
  @Roles('student')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Withdraw application (Students only)' })
  @ApiResponse({
    status: 204,
    description: 'Application withdrawn successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Application not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot withdraw application',
  })
  async withdraw(
    @Param('id') id: string,
    @Request() req,
  ): Promise<void> {
    return this.applicationsService.withdraw(id, req.user.userID);
  }

  @Get('job/:jobId/applications')
  @Roles('recruiter', 'platform_admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all applications for a specific job (Recruiters and Admins only)' })
  @ApiResponse({
    status: 200,
    description: 'Job applications retrieved successfully',
    type: [ApplicationResponseDto],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  async getJobApplications(
    @Param('jobId') jobId: string,
    @Query() searchDto: ApplicationSearchDto,
    @Request() req,
  ): Promise<{ applications: ApplicationResponseDto[]; total: number }> {
    const searchWithJobId = { ...searchDto, jobID: jobId };
    return this.applicationsService.findAll(searchWithJobId, req.user.type, req.user.userID);
  }

  @Get('student/:studentId/applications')
  @Roles('recruiter', 'university_admin', 'platform_admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all applications by a specific student (Recruiters and Admins only)' })
  @ApiResponse({
    status: 200,
    description: 'Student applications retrieved successfully',
    type: [ApplicationResponseDto],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  async getStudentApplications(
    @Param('studentId') studentId: string,
    @Query() searchDto: ApplicationSearchDto,
    @Request() req,
  ): Promise<{ applications: ApplicationResponseDto[]; total: number }> {
    const searchWithStudentId = { ...searchDto, studentID: studentId };
    return this.applicationsService.findAll(searchWithStudentId, req.user.type, req.user.userID);
  }

  @Post(':id/bulk-status')
  @Roles('recruiter', 'platform_admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update multiple applications status (Recruiters and Admins only)' })
  @ApiResponse({
    status: 200,
    description: 'Applications updated successfully',
  })
  async bulkUpdateStatus(
    @Body() bulkUpdateDto: {
      applicationIds: string[];
      status: ApplicationStatus;
      recruiterNotes?: string;
    },
    @Request() req,
  ): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    for (const applicationId of bulkUpdateDto.applicationIds) {
      try {
        await this.applicationsService.updateStatus(
          applicationId,
          {
            status: bulkUpdateDto.status,
            recruiterNotes: bulkUpdateDto.recruiterNotes,
          },
          req.user.userID,
        );
        updated++;
      } catch (error) {
        failed++;
      }
    }

    return { updated, failed };
  }
}