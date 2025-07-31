import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty,
  IsOptional, 
  IsString, 
  IsEnum, 
  IsNumber, 
  IsArray, 
  IsUrl,
  IsEmail,
  IsPhoneNumber,
  Min
} from 'class-validator';
import { VerificationStatus } from '../../../common/enums/user-status.enum';

export class CreateUniversityDto {
  @ApiProperty({ example: 'University of Rwanda' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ 
    example: 'Leading public university in Rwanda offering world-class education...',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Kigali, Rwanda' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ 
    example: 'https://ur.ac.rw',
    required: false 
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ 
    example: 'info@ur.ac.rw',
    required: false 
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiProperty({ 
    example: '+250123456789',
    required: false 
  })
  @IsOptional()
  @IsPhoneNumber()
  contactPhone?: string;

  @ApiProperty({ 
    example: 1963,
    required: false 
  })
  @IsOptional()
  @IsNumber()
  establishedYear?: number;

  @ApiProperty({ 
    example: 15000,
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  studentCount?: number;

  @ApiProperty({ 
    example: ['Computer Science', 'Engineering', 'Business', 'Medicine'],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  programs?: string[];

  @ApiProperty({ 
    example: 1,
    required: false 
  })
  @IsOptional()
  @IsNumber()
  ranking?: number;
}

export class UpdateUniversityDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPhoneNumber()
  contactPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  establishedYear?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  studentCount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  programs?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  ranking?: number;
}

export class VerifyStudentDto {
  @ApiProperty({ example: 'student-uuid-123' })
  @IsNotEmpty()
  @IsString()
  studentID: string;

  @ApiProperty({ example: 'STU123456' })
  @IsNotEmpty()
  @IsString()
  studentNumber: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  program?: string;

  @ApiProperty({ example: 2024 })
  @IsOptional()
  @IsNumber()
  expectedGraduationYear?: number;

  @ApiProperty({ 
    example: 'verified',
    enum: ['verified', 'rejected']
  })
  @IsEnum(['verified', 'rejected'])
  status: string;

  @ApiProperty({ 
    example: 'Student verified successfully',
    required: false 
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class PlacementReportDto {
  @ApiProperty({ example: 2024 })
  @IsNotEmpty()
  @IsNumber()
  year: number;

  @ApiProperty({ example: 'Q1' })
  @IsOptional()
  @IsString()
  quarter?: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  program?: string;
}

export class UniversityResponseDto {
  @ApiProperty()
  universityID: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  website?: string;

  @ApiProperty()
  logoURL?: string;

  @ApiProperty()
  contactEmail?: string;

  @ApiProperty()
  contactPhone?: string;

  @ApiProperty({ enum: VerificationStatus })
  verificationStatus: VerificationStatus;

  @ApiProperty()
  ranking?: number;

  @ApiProperty()
  establishedYear?: number;

  @ApiProperty()
  studentCount: number;

  @ApiProperty()
  accreditations?: any;

  @ApiProperty()
  programs?: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PlacementStatsDto {
  @ApiProperty()
  totalGraduates: number;

  @ApiProperty()
  placedGraduates: number;

  @ApiProperty()
  placementRate: number;

  @ApiProperty()
  averageSalary: number;

  @ApiProperty()
  topEmployers: Array<{ name: string; hiredCount: number }>;

  @ApiProperty()
  placementsByProgram: Array<{ program: string; placementRate: number; count: number }>;

  @ApiProperty()
  placementsByIndustry: Array<{ industry: string; count: number }>;

  @ApiProperty()
  placementTrends: Array<{ period: string; placementRate: number }>;
}

export class StudentVerificationDto {
  @ApiProperty()
  studentID: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  studentNumber?: string;

  @ApiProperty()
  program?: string;

  @ApiProperty()
  graduationYear?: number;

  @ApiProperty()
  verificationStatus: string;

  @ApiProperty()
  appliedAt: Date;

  @ApiProperty()
  verifiedAt?: Date;

  @ApiProperty()
  notes?: string;
}
