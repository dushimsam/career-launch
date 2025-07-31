import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompaniesService } from './companies.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyResponseDto,
  CompanyStatsDto,
} from './dto/company.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import * as multer from 'multer';
import { extname } from 'path';

@ApiTags('Companies')
@Controller('companies')
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  // @UseGuards(RolesGuard)
  // @Roles('platformadmin')
  @ApiOperation({ summary: 'Create a new company (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully',
    type: CompanyResponseDto,
  })
  async create(@Body() createDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    return this.companiesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies with filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'industry', required: false, description: 'Filter by industry' })
  @ApiQuery({ name: 'size', required: false, description: 'Filter by company size' })
  @ApiQuery({ name: 'location', required: false, description: 'Filter by location' })
  @ApiQuery({ name: 'verified', required: false, type: Boolean, description: 'Filter by verification status' })
  @ApiResponse({
    status: 200,
    description: 'Companies retrieved successfully',
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('industry') industry?: string,
    @Query('size') size?: string,
    @Query('location') location?: string,
    @Query('verified') verified?: boolean,
  ) {
    return this.companiesService.findAll(page, limit, industry, size, location, verified);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search companies' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Companies found successfully',
  })
  async searchCompanies(
    @Query('q') query?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.companiesService.searchCompanies(query, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({
    status: 200,
    description: 'Company found successfully',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  async findById(@Param('id') companyID: string): Promise<CompanyResponseDto> {
    return this.companiesService.findById(companyID);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('recruiter')
  @ApiOperation({ summary: 'Update company (Recruiters only)' })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully',
    type: CompanyResponseDto,
  })
  async update(
    @Param('id') companyID: string,
    @Body() updateDto: UpdateCompanyDto,
    @Request() req,
  ): Promise<CompanyResponseDto> {
    return this.companiesService.update(companyID, updateDto, req.user.userID);
  }

  @Post(':id/upload-logo')
  @UseGuards(RolesGuard)
  @Roles('recruiter')
  @ApiOperation({ summary: 'Upload company logo (Recruiters only)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Logo uploaded successfully',
    type: CompanyResponseDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: './uploads/logos',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, `company-${req.params.id}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    })
  )
  async uploadLogo(
    @Param('id') companyID: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File
  ): Promise<CompanyResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const logoUrl = `/uploads/logos/${file.filename}`;
    return this.companiesService.uploadLogo(companyID, logoUrl, req.user.userID);
  }

  @Get(':id/stats')
  @UseGuards(RolesGuard)
  @Roles('recruiter')
  @ApiOperation({ summary: 'Get company statistics (Recruiters only)' })
  @ApiResponse({
    status: 200,
    description: 'Company statistics retrieved successfully',
    type: CompanyStatsDto,
  })
  async getStats(
    @Param('id') companyID: string,
    @Request() req,
  ): Promise<CompanyStatsDto> {
    return this.companiesService.getCompanyStats(companyID, req.user.userID);
  }

  @Get(':id/jobs')
  @ApiOperation({ summary: 'Get company jobs' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by job status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Company jobs retrieved successfully',
  })
  async getCompanyJobs(
    @Param('id') companyID: string,
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.companiesService.getCompanyJobs(companyID, status, page, limit);
  }

  // Admin endpoints
  @Put(':id/verify')
  @UseGuards(RolesGuard)
  @Roles('platformadmin')
  @ApiOperation({ summary: 'Verify company (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Company verification status updated successfully',
  })
  async verifyCompany(
    @Param('id') companyID: string,
    @Body('status') status: string,
  ) {
    return this.companiesService.verifyCompany(companyID, status as any);
  }
}
