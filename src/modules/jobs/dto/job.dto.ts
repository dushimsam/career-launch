import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty,
  IsOptional, 
  IsString, 
  IsEnum, 
  IsNumber, 
  IsArray, 
  IsUrl,
  IsBoolean,
  IsDateString,
  Min,
  Max
} from 'class-validator';
import { 
  JobType, 
  ExperienceLevel, 
  JobStatus 
} from '../../../common/enums/user-status.enum';

export class CreateJobDto {
  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ 
    example: 'We are looking for a senior software engineer to join our growing team...' 
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ 
    example: ['Bachelor\'s degree in Computer Science', '5+ years of experience', 'Strong problem-solving skills'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiProperty({ 
    example: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillsRequired?: string[];

  @ApiProperty({ 
    enum: ExperienceLevel,
    example: ExperienceLevel.SENIOR
  })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @ApiProperty({ 
    enum: JobType,
    example: JobType.FULL_TIME
  })
  @IsEnum(JobType)
  jobType: JobType;

  @ApiProperty({ 
    example: { min: 80000, max: 120000, currency: 'USD', period: 'annually' }
  })
  @IsOptional()
  salary?: {
    min?: number;
    max?: number;
    currency: string;
    period?: string;
  };

  @ApiProperty({ example: 'Kigali, Rwanda' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isHybrid?: boolean;

  @ApiProperty({ 
    example: ['Health Insurance', 'Flexible Hours', 'Learning Budget'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiProperty({ 
    example: ['Design and develop software applications', 'Mentor junior developers', 'Collaborate with cross-functional teams'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsibilities?: string[];

  @ApiProperty({ example: 'Bachelor\'s degree in Computer Science or related field' })
  @IsOptional()
  @IsString()
  educationRequirement?: string;

  @ApiProperty({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  experienceYears?: number;

  @ApiProperty({ example: 'Engineering' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ 
    example: ['senior', 'engineer', 'react', 'remote'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  positions?: number;

  @ApiProperty({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({ example: 'https://company.com/apply/job123' })
  @IsOptional()
  @IsUrl()
  externalApplicationUrl?: string;
}

export class UpdateJobDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillsRequired?: string[];

  @ApiProperty({ required: false, enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiProperty({ required: false, enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiProperty({ required: false })
  @IsOptional()
  salary?: {
    min?: number;
    max?: number;
    currency: string;
    period?: string;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isHybrid?: boolean;

  @ApiProperty({ required: false, enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsibilities?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  educationRequirement?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  experienceYears?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  positions?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}

export class JobSearchDto {
  @ApiProperty({ required: false, example: 'Software Engineer' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ required: false, example: 'Kigali' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false, example: 'Technology' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({ required: false, enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiProperty({ required: false, enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @ApiProperty({ required: false, example: ['JavaScript', 'React'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ required: false, example: 50000 })
  @IsOptional()
  @IsNumber()
  minSalary?: number;

  @ApiProperty({ required: false, example: 100000 })
  @IsOptional()
  @IsNumber()
  maxSalary?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiProperty({ required: false, example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false, example: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

export class JobResponseDto {
  @ApiProperty()
  jobID: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  requirements?: string[];

  @ApiProperty()
  skillsRequired?: string[];

  @ApiProperty({ enum: ExperienceLevel })
  experienceLevel: ExperienceLevel;

  @ApiProperty({ enum: JobType })
  jobType: JobType;

  @ApiProperty()
  salary?: any;

  @ApiProperty()
  location?: string;

  @ApiProperty()
  isRemote: boolean;

  @ApiProperty()
  isHybrid: boolean;

  @ApiProperty({ enum: JobStatus })
  status: JobStatus;

  @ApiProperty()
  deadline?: Date;

  @ApiProperty()
  benefits?: string[];

  @ApiProperty()
  responsibilities?: string[];

  @ApiProperty()
  educationRequirement?: string;

  @ApiProperty()
  experienceYears?: number;

  @ApiProperty()
  category?: string;

  @ApiProperty()
  tags?: string[];

  @ApiProperty()
  positions: number;

  @ApiProperty()
  applicationCount: number;

  @ApiProperty()
  priority: number;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  company: any;

  @ApiProperty()
  recruiter: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  publishedAt?: Date;
}
