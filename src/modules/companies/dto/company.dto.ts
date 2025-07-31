import { ApiProperty } from '@nestjs/swagger';
import { 
  IsOptional, 
  IsString, 
  IsEnum, 
  IsNumber, 
  IsArray, 
  IsUrl,
  IsEmail,
  IsPhoneNumber 
} from 'class-validator';
import { CompanySize, VerificationStatus } from '../../../common/enums/user-status.enum';

export class CreateCompanyDto {
  @ApiProperty({ example: 'TechCorp Solutions' })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: 'Leading technology company focused on innovative software solutions...' 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    enum: CompanySize, 
    example: CompanySize.SME 
  })
  @IsOptional()
  @IsEnum(CompanySize)
  size?: CompanySize;

  @ApiProperty({ example: 'Technology' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({ example: 'Kigali, Rwanda' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 'https://techcorp.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ example: 'contact@techcorp.com' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiProperty({ example: '+250123456789' })
  @IsOptional()
  @IsPhoneNumber()
  contactPhone?: string;

  @ApiProperty({ example: 2015 })
  @IsOptional()
  @IsNumber()
  foundedYear?: number;

  @ApiProperty({ example: 150 })
  @IsOptional()
  @IsNumber()
  employeeCount?: number;

  @ApiProperty({ 
    example: ['Health Insurance', 'Flexible Hours', 'Remote Work', 'Learning Budget'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiProperty({ 
    example: ['React', 'Node.js', 'Python', 'AWS', 'Docker'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @ApiProperty({ example: 'To revolutionize how businesses operate through technology' })
  @IsOptional()
  @IsString()
  mission?: string;

  @ApiProperty({ example: 'A world where technology empowers every business' })
  @IsOptional()
  @IsString()
  vision?: string;

  @ApiProperty({ 
    example: ['Innovation', 'Collaboration', 'Excellence', 'Integrity'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  values?: string[];
}

export class UpdateCompanyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, enum: CompanySize })
  @IsOptional()
  @IsEnum(CompanySize)
  size?: CompanySize;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  industry?: string;

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
  foundedYear?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  employeeCount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mission?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  vision?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  values?: string[];
}

export class CompanyResponseDto {
  @ApiProperty()
  companyID: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty({ enum: CompanySize })
  size?: CompanySize;

  @ApiProperty()
  industry?: string;

  @ApiProperty()
  location?: string;

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
  foundedYear?: number;

  @ApiProperty()
  employeeCount?: number;

  @ApiProperty()
  benefits?: string[];

  @ApiProperty()
  technologies?: string[];

  @ApiProperty()
  mission?: string;

  @ApiProperty()
  vision?: string;

  @ApiProperty()
  values?: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CompanyStatsDto {
  @ApiProperty()
  totalJobs: number;

  @ApiProperty()
  activeJobs: number;

  @ApiProperty()
  totalApplications: number;

  @ApiProperty()
  hiredCandidates: number;

  @ApiProperty()
  averageTimeToHire: number;

  @ApiProperty()
  topSkillsRequired: Array<{ skill: string; count: number }>;

  @ApiProperty()
  applicationsByMonth: Array<{ month: string; count: number }>;
}
