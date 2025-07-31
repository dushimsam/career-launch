import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  AdminDashboardDto,
  UserManagementDto,
  SystemStatsDto,
  ModerateContentDto,
  UserActionDto,
  GenerateReportDto,
  AdminSearchUsersDto,
  BulkUserActionDto,
} from './dto/admin.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('platform_admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    type: AdminDashboardDto,
  })
  async getDashboard(@Request() req): Promise<AdminDashboardDto> {
    return this.adminService.getDashboardStats(req.user.userID);
  }

  @Get('stats/system')
  @ApiOperation({ summary: 'Get detailed system statistics' })
  @ApiResponse({
    status: 200,
    description: 'System statistics retrieved successfully',
    type: SystemStatsDto,
  })
  async getSystemStats(@Request() req): Promise<SystemStatsDto> {
    return this.adminService.getSystemStats(req.user.userID);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userType', required: false, enum: ['student', 'recruiter', 'university_admin', 'platform_admin'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'suspended', 'pending_verification'] })
  async getAllUsers(
    @Request() req,
    @Query() searchDto: AdminSearchUsersDto,
  ): Promise<{ users: UserManagementDto[]; total: number }> {
    const { page, limit, userType, status } = searchDto;
    return this.adminService.getAllUsers(
      req.user.userID,
      page,
      limit,
      userType,
      status,
    );
  }

  @Patch('users/:userId/action')
  @ApiOperation({ summary: 'Perform action on a specific user' })
  @ApiResponse({
    status: 200,
    description: 'User action performed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async manageUser(
    @Request() req,
    @Param('userId') userId: string,
    @Body() actionDto: UserActionDto,
  ): Promise<{ message: string }> {
    return this.adminService.manageUser(
      req.user.userID,
      userId,
      actionDto.action,
      actionDto.reason,
    );
  }

  @Post('users/bulk-action')
  @ApiOperation({ summary: 'Perform bulk action on multiple users' })
  @ApiResponse({
    status: 200,
    description: 'Bulk action performed successfully',
  })
  async bulkUserAction(
    @Request() req,
    @Body() bulkActionDto: BulkUserActionDto,
  ): Promise<{ processed: number; failed: number; results: any[] }> {
    const results = [];
    let processed = 0;
    let failed = 0;

    for (const userId of bulkActionDto.userIds) {
      try {
        const result = await this.adminService.manageUser(
          req.user.userID,
          userId,
          bulkActionDto.action,
          bulkActionDto.reason,
        );
        results.push({ userId, success: true, message: result.message });
        processed++;
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
        failed++;
      }
    }

    return { processed, failed, results };
  }

  @Post('moderate-content')
  @ApiOperation({ summary: 'Moderate content (jobs, companies, etc.)' })
  @ApiResponse({
    status: 200,
    description: 'Content moderated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Content not found',
  })
  async moderateContent(
    @Request() req,
    @Body() moderateDto: ModerateContentDto,
  ): Promise<{ message: string }> {
    return this.adminService.moderateContent(req.user.userID, moderateDto);
  }

  @Post('reports/generate')
  @ApiOperation({ summary: 'Generate system reports' })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully',
  })
  async generateReport(
    @Request() req,
    @Body() reportDto: GenerateReportDto,
  ): Promise<any> {
    const startDate = reportDto.startDate ? new Date(reportDto.startDate) : undefined;
    const endDate = reportDto.endDate ? new Date(reportDto.endDate) : undefined;

    return this.adminService.generateReport(
      req.user.userID,
      reportDto.reportType,
      startDate,
      endDate,
    );
  }

  @Get('reports/user-registrations')
  @ApiOperation({ summary: 'Get user registration report' })
  @ApiResponse({
    status: 200,
    description: 'User registration report retrieved successfully',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getUserRegistrationReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.adminService.generateReport(
      req.user.userID,
      'user_registrations',
      start,
      end,
    );
  }

  @Get('reports/job-applications')
  @ApiOperation({ summary: 'Get job application report' })
  @ApiResponse({
    status: 200,
    description: 'Job application report retrieved successfully',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getJobApplicationReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.adminService.generateReport(
      req.user.userID,
      'job_applications',
      start,
      end,
    );
  }

  @Get('reports/company-activity')
  @ApiOperation({ summary: 'Get company activity report' })
  @ApiResponse({
    status: 200,
    description: 'Company activity report retrieved successfully',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getCompanyActivityReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.adminService.generateReport(
      req.user.userID,
      'company_activity',
      start,
      end,
    );
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({
    status: 200,
    description: 'System health retrieved successfully',
  })
  async getSystemHealth(): Promise<{
    status: string;
    uptime: number;
    memoryUsage: any;
    timestamp: Date;
  }> {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date(),
    };
  }

  @Get('pending-verifications')
  @ApiOperation({ summary: 'Get all pending verifications' })
  @ApiResponse({
    status: 200,
    description: 'Pending verifications retrieved successfully',
  })
  async getPendingVerifications(@Request() req): Promise<{
    companies: any[];
    universities: any[];
    users: any[];
  }> {
    // This would typically involve querying multiple entities
    // Implementation would depend on your specific verification workflow
    return {
      companies: [],
      universities: [],
      users: [],
    };
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get admin action audit logs' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'adminId', required: false, type: String })
  async getAuditLogs(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('action') action?: string,
    @Query('adminId') adminId?: string,
  ): Promise<{
    logs: any[];
    total: number;
  }> {
    // In a real implementation, you'd query an audit log table
    return {
      logs: [],
      total: 0,
    };
  }
}