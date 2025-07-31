import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty,
  IsOptional, 
  IsString, 
  IsEnum, 
  IsNumber, 
  IsDateString,
  IsBoolean,
  Min,
  Max
} from 'class-validator';
import { ApplicationStatus } from '../../../common/enums/user-status.enum';

export class CreateApplicationDto {
  @ApiProperty({ example: 'job-uuid-123' })
  @IsNotEmpty()
  @IsString()
  jobID: string;

  @ApiProperty({ 
    example: 'I am very interested in this position because...',
    required: false 
  })
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiProperty({ 
    example: { amount: 80000, currency: 'USD', period: 'annually' },
    required: false 
  })
  @IsOptional()
  expectedSalary?: {
    amount: number;
    currency: string;
    period: string;
  };

  @ApiProperty({ example: '2024-03-01', required: false })
  @IsOptional()
  @IsDateString()
  availabilityDate?: string;

  @ApiProperty({ 
    example: 'Looking forward to contributing to your team...',
    required: false 
  })
  @IsOptional()
  @IsString()
  studentNotes?: string;
}

export class UpdateApplicationStatusDto {
  @ApiProperty({ 
    enum: ApplicationStatus,
    example: ApplicationStatus.UNDER_REVIEW
  })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiProperty({ 
    example: 'Candidate shows strong technical skills...',
    required: false 
  })
  @IsOptional()
  @IsString()
  recruiterNotes?: string;

  @ApiProperty({ 
    example: '2024-02-15T10:00:00Z',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  interviewDate?: string;

  @ApiProperty({ 
    example: 'Great communication skills during the interview',
    required: false 
  })
  @IsOptional()
  @IsString()
  interviewFeedback?: string;

  @ApiProperty({ 
    example: 'Overqualified for this position',
    required: false 
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class ScheduleInterviewDto {
  @ApiProperty({ example: '2024-02-15T10:00:00Z' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ 
    example: 'video',
    enum: ['phone', 'video', 'in-person']
  })
  @IsString()
  interviewType: string;

  @ApiProperty({ 
    example: 'Conference Room A / Zoom Link: https://zoom.us/...',
    required: false 
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  interviewerName: string;

  @ApiProperty({ example: 'john.doe@company.com' })
  @IsString()
  interviewerEmail: string;

  @ApiProperty({ 
    example: 'Please prepare to discuss your React experience',
    required: false 
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApplicationResponseDto {
  @ApiProperty()
  applicationID: string;

  @ApiProperty()
  studentID: string;

  @ApiProperty()
  jobID: string;

  @ApiProperty({ enum: ApplicationStatus })
  status: ApplicationStatus;

  @ApiProperty()
  coverLetter?: string;

  @ApiProperty()
  appliedAt: Date;

  @ApiProperty()
  statusHistory?: any[];

  @ApiProperty()
  recruiterNotes?: string;

  @ApiProperty()
  interviewDate?: Date;

  @ApiProperty()
  score?: number;

  @ApiProperty()
  expectedSalary?: any;

  @ApiProperty()
  availabilityDate?: Date;

  @ApiProperty()
  skillsMatchPercentage?: number;

  @ApiProperty()
  student?: {
    userID: string;
    name: string;
    email: string;
    skills: string[];
    resumeURL?: string;
    gpa?: number;
    graduationYear?: number;
  };

  @ApiProperty()
  job?: {
    jobID: string;
    title: string;
    company?: {
      companyID: string;
      name: string;
      logoURL?: string;
    };
    location: string;
    jobType: string;
    experienceLevel: string;
  };
}

export class ApplicationStatsDto {
  @ApiProperty()
  totalApplications: number;

  @ApiProperty()
  submittedApplications: number;

  @ApiProperty()
  underReviewApplications: number;

  @ApiProperty()
  shortlistedApplications: number;

  @ApiProperty()
  interviewedApplications: number;

  @ApiProperty()
  acceptedApplications: number;

  @ApiProperty()
  rejectedApplications: number;

  @ApiProperty()
  successRate: number;

  @ApiProperty()
  averageResponseTime: number;

  @ApiProperty()
  applicationsByMonth: Array<{ month: string; count: number }>;
}

export class ApplicationSearchDto {
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ required: false, enum: ApplicationStatus })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  studentID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  companyID?: string;

  @ApiProperty({ required: false, example: 'appliedAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false, example: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

export class BulkApplicationActionDto {
  @ApiProperty({ example: ['app-id-1', 'app-id-2'] })
  @IsNotEmpty()
  applicationIDs: string[];

  @ApiProperty({ 
    enum: ApplicationStatus,
    example: ApplicationStatus.REJECTED
  })
  @IsEnum(ApplicationStatus)
  action: ApplicationStatus;

  @ApiProperty({ 
    example: 'Position has been filled',
    required: false 
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
