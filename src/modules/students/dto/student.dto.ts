import { ApiProperty } from '@nestjs/swagger';
import { 
  IsOptional, 
  IsString, 
  IsNumber, 
  IsArray, 
  IsEnum, 
  IsDecimal,
  IsUrl,
  Min,
  Max,
  IsJSON 
} from 'class-validator';
import { AcademicLevel } from '../../../common/enums/user-status.enum';

export class UpdateStudentProfileDto {
  @ApiProperty({ required: false, example: 'STU123456' })
  @IsOptional()
  @IsString()
  studentID?: string;

  @ApiProperty({ required: false, example: 3.8, minimum: 0, maximum: 4.0 })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  @Max(4.0)
  GPA?: number;

  @ApiProperty({ required: false, example: 2024 })
  @IsOptional()
  @IsNumber()
  graduationYear?: number;

  @ApiProperty({ required: false, example: ['JavaScript', 'React', 'Node.js'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ required: false, example: 'Computer Science' })
  @IsOptional()
  @IsString()
  major?: string;

  @ApiProperty({ required: false, example: 'Mathematics' })
  @IsOptional()
  @IsString()
  minor?: string;

  @ApiProperty({ 
    required: false, 
    enum: AcademicLevel,
    example: AcademicLevel.UNDERGRADUATE 
  })
  @IsOptional()
  @IsEnum(AcademicLevel)
  academicLevel?: AcademicLevel;

  @ApiProperty({ 
    required: false, 
    example: 'Passionate software developer with experience in full-stack development...' 
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ 
    required: false, 
    example: ['JavaScript', 'Python', 'Java', 'TypeScript'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  programmingLanguages?: string[];

  @ApiProperty({ 
    required: false, 
    example: ['React', 'Node.js', 'Express', 'NestJS', 'MongoDB'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  frameworks?: string[];

  @ApiProperty({ required: false, example: 'university-uuid-123' })
  @IsOptional()
  @IsString()
  universityID?: string;
}

export class UpdateJobPreferencesDto {
  @ApiProperty({ 
    required: false, 
    example: ['full_time', 'internship'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jobTypes?: string[];

  @ApiProperty({ 
    required: false, 
    example: ['Remote', 'Kigali', 'Nairobi'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[];

  @ApiProperty({ 
    required: false,
    example: { min: 50000, max: 80000, currency: 'USD' }
  })
  @IsOptional()
  salaryRange?: {
    min?: number;
    max?: number;
    currency: string;
  };

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  remoteWork?: boolean;

  @ApiProperty({ 
    required: false, 
    example: ['Technology', 'Finance', 'Healthcare'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industries?: string[];
}

export class AddCertificationDto {
  @ApiProperty({ example: 'AWS Solutions Architect' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Amazon Web Services' })
  @IsString()
  issuer: string;

  @ApiProperty({ example: '2023-06-15' })
  @IsString()
  date: string;

  @ApiProperty({ 
    required: false, 
    example: 'https://aws.amazon.com/certification/verify' 
  })
  @IsOptional()
  @IsUrl()
  url?: string;
}

export class AddWorkExperienceDto {
  @ApiProperty({ example: 'Tech Solutions Ltd' })
  @IsString()
  company: string;

  @ApiProperty({ example: 'Junior Software Developer' })
  @IsString()
  position: string;

  @ApiProperty({ example: '2022-01-15' })
  @IsString()
  startDate: string;

  @ApiProperty({ required: false, example: '2023-12-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ 
    example: 'Developed web applications using React and Node.js, collaborated with cross-functional teams...' 
  })
  @IsString()
  description: string;

  @ApiProperty({ example: ['React', 'Node.js', 'MongoDB'] })
  @IsArray()
  @IsString({ each: true })
  skills: string[];
}

export class AddProjectDto {
  @ApiProperty({ example: 'E-commerce Platform' })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: 'Full-stack e-commerce platform with payment integration...' 
  })
  @IsString()
  description: string;

  @ApiProperty({ example: ['React', 'Node.js', 'MongoDB', 'Stripe'] })
  @IsArray()
  @IsString({ each: true })
  technologies: string[];

  @ApiProperty({ 
    required: false, 
    example: 'https://myproject.com' 
  })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty({ 
    required: false, 
    example: 'https://github.com/user/project' 
  })
  @IsOptional()
  @IsUrl()
  githubUrl?: string;
}

export class StudentResponseDto {
  @ApiProperty()
  userID: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  studentID: string;

  @ApiProperty()
  universityID?: string;

  @ApiProperty()
  GPA?: number;

  @ApiProperty()
  graduationYear?: number;

  @ApiProperty()
  skills?: string[];

  @ApiProperty()
  major?: string;

  @ApiProperty()
  minor?: string;

  @ApiProperty()
  academicLevel?: AcademicLevel;

  @ApiProperty()
  bio?: string;

  @ApiProperty()
  programmingLanguages?: string[];

  @ApiProperty()
  frameworks?: string[];

  @ApiProperty()
  resumeURL?: string;

  @ApiProperty()
  profilePictureURL?: string;

  @ApiProperty()
  jobPreferences?: any;

  @ApiProperty()
  certifications?: any[];

  @ApiProperty()
  workExperience?: any[];

  @ApiProperty()
  projects?: any[];

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
