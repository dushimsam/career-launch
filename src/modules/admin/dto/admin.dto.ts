import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';
import { UserStatus } from '../../../common/enums/user-status.enum';

export class AdminDashboardDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  totalStudents: number;

  @ApiProperty()
  totalRecruiters: number;

  @ApiProperty()
  totalCompanies: number;

  @ApiProperty()
  totalJobs: number;

  @ApiProperty()
  totalApplications: number;

  @ApiProperty()
  activeJobs: number;

  @ApiProperty()
  pendingVerifications: number;

  @ApiProperty()
  recentUsers: number;

  @ApiProperty()
  applicationStats: Record<string, number>;

  @ApiProperty()
  userGrowthData: Array<{ month: string; count: number }>;

  @ApiProperty()
  systemHealth: {
    status: string;
    uptime: number;
    memoryUsage: any;
  };
}

export class UserManagementDto {
  @ApiProperty()
  userID: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  lastLogin?: Date;

  @ApiProperty()
  userType: string;
}

export class SystemStatsDto {
  @ApiProperty()
  usersByStatus: Record<string, number>;

  @ApiProperty()
  companiesByVerificationStatus: Record<string, number>;

  @ApiProperty()
  jobsByStatus: Record<string, number>;

  @ApiProperty()
  applicationsByStatus: Record<string, number>;

  @ApiProperty()
  topUniversities: Array<{ name: string; studentCount: number }>;

  @ApiProperty()
  topCompanies: Array<{ name: string; jobCount: number }>;
}

export class ModerateContentDto {
  @ApiProperty({
    enum: ['job', 'company', 'user'],
    example: 'job'
  })
  @IsEnum(['job', 'company', 'user'])
  entityType: string;

  @ApiProperty({ example: 'entity-uuid-123' })
  @IsString()
  entityId: string;

  @ApiProperty({
    enum: ['approve', 'reject', 'suspend'],
    example: 'approve'
  })
  @IsEnum(['approve', 'reject', 'suspend'])
  action: string;

  @ApiProperty({
    example: 'Content violates community guidelines',
    required: false
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UserActionDto {
  @ApiProperty({
    enum: ['suspend', 'activate', 'verify', 'unverify'],
    example: 'suspend'
  })
  @IsEnum(['suspend', 'activate', 'verify', 'unverify'])
  action: string;

  @ApiProperty({
    example: 'Violation of terms of service',
    required: false
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class GenerateReportDto {
  @ApiProperty({
    enum: ['user_registrations', 'job_applications', 'company_activity'],
    example: 'user_registrations'
  })
  @IsEnum(['user_registrations', 'job_applications', 'company_activity'])
  reportType: string;

  @ApiProperty({
    example: '2024-01-01',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2024-12-31',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class AdminSearchUsersDto {
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({
    required: false,
    enum: ['student', 'recruiter', 'university_admin', 'platform_admin'],
    example: 'student'
  })
  @IsOptional()
  @IsEnum(['student', 'recruiter', 'university_admin', 'platform_admin'])
  userType?: string;

  @ApiProperty({
    required: false,
    enum: UserStatus,
    example: UserStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({
    required: false,
    example: 'john.doe@example.com'
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    required: false,
    example: 'John Doe'
  })
  @IsOptional()
  @IsString()
  name?: string;
}

export class BulkUserActionDto {
  @ApiProperty({
    example: ['user-id-1', 'user-id-2'],
    description: 'Array of user IDs to perform action on'
  })
  @IsString({ each: true })
  userIds: string[];

  @ApiProperty({
    enum: ['suspend', 'activate', 'verify', 'delete'],
    example: 'suspend'
  })
  @IsEnum(['suspend', 'activate', 'verify', 'delete'])
  action: string;

  @ApiProperty({
    example: 'Bulk action for policy violation',
    required: false
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SystemConfigDto {
  @ApiProperty()
  maintenance: boolean;

  @ApiProperty()
  registrationEnabled: boolean;

  @ApiProperty()
  jobPostingEnabled: boolean;

  @ApiProperty()
  emailNotifications: boolean;

  @ApiProperty()
  smsNotifications: boolean;

  @ApiProperty()
  maxFileUploadSize: number;

  @ApiProperty()
  supportedFileTypes: string[];
}