import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty,
  IsOptional, 
  IsString, 
  IsEnum, 
  IsBoolean, 
  IsUrl,
  IsArray
} from 'class-validator';
import { PortfolioType } from '../../../common/enums/user-status.enum';

export class CreatePortfolioDto {
  @ApiProperty({ 
    enum: PortfolioType,
    example: PortfolioType.GITHUB
  })
  @IsEnum(PortfolioType)
  platform: PortfolioType;

  @ApiProperty({ example: 'https://github.com/username' })
  @IsUrl()
  profileURL: string;

  @ApiProperty({ 
    example: 'My Development Portfolio',
    required: false 
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ 
    example: 'Collection of my software development projects...',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  autoSync?: boolean;
}

export class UpdatePortfolioDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  profileURL?: string;

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
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  autoSync?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'E-commerce Platform' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ 
    example: 'Full-stack e-commerce platform built with React and Node.js...' 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    example: ['React', 'Node.js', 'MongoDB', 'Express'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @ApiProperty({ 
    example: 'https://myproject.vercel.app',
    required: false 
  })
  @IsOptional()
  @IsUrl()
  projectURL?: string;

  @ApiProperty({ 
    example: 'https://github.com/user/project',
    required: false 
  })
  @IsOptional()
  @IsUrl()
  repositoryURL?: string;

  @ApiProperty({ 
    example: ['https://example.com/screenshot1.png'],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  imageURLs?: string[];

  @ApiProperty({ 
    example: 'https://youtube.com/watch?v=demo',
    required: false 
  })
  @IsOptional()
  @IsUrl()
  videoURL?: string;

  @ApiProperty({ 
    example: 'active',
    required: false 
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ 
    example: ['web-development', 'e-commerce', 'react'],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @ApiProperty({ 
    example: 'MIT',
    required: false 
  })
  @IsOptional()
  @IsString()
  license?: string;
}

export class UpdateProjectDto {
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
  technologies?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  projectURL?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  repositoryURL?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  imageURLs?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  videoURL?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  license?: string;
}

export class PortfolioResponseDto {
  @ApiProperty()
  portfolioID: string;

  @ApiProperty({ enum: PortfolioType })
  platform: PortfolioType;

  @ApiProperty()
  profileURL: string;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  lastSynced?: Date;

  @ApiProperty()
  title?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  metadata?: any;

  @ApiProperty()
  statistics?: any;

  @ApiProperty()
  syncStatus?: any;

  @ApiProperty()
  autoSync: boolean;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  projects?: any[];

  @ApiProperty()
  student?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ProjectResponseDto {
  @ApiProperty()
  projectID: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  technologies?: string[];

  @ApiProperty()
  projectURL?: string;

  @ApiProperty()
  repositoryURL?: string;

  @ApiProperty()
  imageURLs?: string[];

  @ApiProperty()
  videoURL?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  starsCount: number;

  @ApiProperty()
  forksCount: number;

  @ApiProperty()
  watchersCount: number;

  @ApiProperty()
  size?: number;

  @ApiProperty()
  primaryLanguage?: string;

  @ApiProperty()
  languageStats?: any;

  @ApiProperty()
  topics?: string[];

  @ApiProperty()
  license?: string;

  @ApiProperty()
  isFork: boolean;

  @ApiProperty()
  isPrivate: boolean;

  @ApiProperty()
  contributionStats?: any;

  @ApiProperty()
  metadata?: any;

  @ApiProperty()
  externalCreatedAt?: Date;

  @ApiProperty()
  externalUpdatedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SyncPortfolioDto {
  @ApiProperty({ example: 'username' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ 
    example: 'github_access_token',
    required: false 
  })
  @IsOptional()
  @IsString()
  accessToken?: string;
}
