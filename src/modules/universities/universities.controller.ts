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
import { UniversitiesService } from './universities.service';
import {
  CreateUniversityDto,
  UpdateUniversityDto,
  VerifyStudentDto,
  PlacementReportDto,
  UniversityResponseDto,
  PlacementStatsDto,
} from './dto/university.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import * as multer from 'multer';
import { extname } from 'path';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Universities')
@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all universities with filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'location', required: false, description: 'Filter by location' })
  @ApiQuery({ name: 'verified', required: false, type: Boolean, description: 'Filter by verification status' })
  @ApiResponse({
    status: 200,
    description: 'Universities retrieved successfully',
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('location') location?: string,
    @Query('verified') verified?: boolean,
  ) {
    return this.universitiesService.findAll(page, limit, location, verified);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search universities' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Universities found successfully',
  })
  async searchUniversities(
    @Query('q') query?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.universitiesService.searchUniversities(query, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get university by ID' })
  @ApiResponse({
    status: 200,
    description: 'University found successfully',
    type: UniversityResponseDto,
  })
  async findById(@Param('id') universityID: string): Promise<UniversityResponseDto> {
    return this.universitiesService.findById(universityID);
  }

  // University Admin endpoints
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('universityadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update university (University Admins only)' })
  @ApiResponse({
    status: 200,
    description: 'University updated successfully',
    type: UniversityResponseDto,
  })
  async update(
    @Param('id') universityID: string,
    @Body() updateDto: UpdateUniversityDto,
    @Request() req,
  ): Promise<UniversityResponseDto> {
    return this.universitiesService.update(universityID, updateDto, req.user.userID);
  }

  @Post(':id/upload-logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('universityadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload university logo (University Admins only)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Logo uploaded successfully',
    type: UniversityResponseDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: './uploads/university-logos',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, `university-${req.params.id}-${uniqueSuffix}${extname(file.originalname)}`);
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
    @Param('id') universityID: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File
  ): Promise<UniversityResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const logoUrl = `/uploads/university-logos/${file.filename}`;
    return this.universitiesService.uploadLogo(universityID, logoUrl, req.user.userID);
  }

  @Post(':id/verify-student')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('universityadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify student enrollment (University Admins only)' })
  @ApiResponse({
    status: 200,
    description: 'Student verification status updated successfully',
  })
  async verifyStudent(
    @Param('id') universityID: string,
    @Body() verifyDto: VerifyStudentDto,
    @Request() req,
  ) {
    return this.universitiesService.verifyStudent(universityID, req.user.userID, verifyDto);
  }

  @Get(':id/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('universityadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get university students (University Admins only)' })
  @ApiQuery({ name: 'verified', required: false, type: Boolean, description: 'Filter by verification status' })
  @ApiQuery({ name: 'program', required: false, description: 'Filter by program' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'University students retrieved successfully',
  })
  async getUniversityStudents(
    @Param('id') universityID: string,
    @Request() req,
    @Query('verified') verified?: boolean,
    @Query('program') program?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.universitiesService.getUniversityStudents(
      universityID,
      req.user.userID,
      verified,
      program,
      page,
      limit
    );
  }

  @Get(':id/placement-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('universityadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get placement statistics (University Admins only)' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Year for statistics' })
  @ApiQuery({ name: 'quarter', required: false, description: 'Quarter (Q1, Q2, Q3, Q4)' })
  @ApiQuery({ name: 'program', required: false, description: 'Filter by program' })
  @ApiResponse({
    status: 200,
    description: 'Placement statistics retrieved successfully',
    type: PlacementStatsDto,
  })
  async getPlacementStats(
    @Param('id') universityID: string,
    @Request() req,
    @Query('year', ParseIntPipe) year?: number,
    @Query('quarter') quarter?: string,
    @Query('program') program?: string,
  ): Promise<PlacementStatsDto> {
    const reportDto: PlacementReportDto = {
      year: year || new Date().getFullYear(),
      quarter,
      program,
    };
    
    return this.universitiesService.getPlacementStats(universityID, req.user.userID, reportDto);
  }

  @Post(':id/share-job/:jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('universityadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Share job opportunity with students (University Admins only)' })
  @ApiResponse({
    status: 200,
    description: 'Job opportunity shared successfully',
  })
  async shareJobOpportunity(
    @Param('id') universityID: string,
    @Param('jobId') jobID: string,
    @Request() req,
  ) {
    return this.universitiesService.shareJobOpportunity(universityID, req.user.userID, jobID);
  }

  // Platform Admin endpoints
  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('platformadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create university (Platform Admins only)' })
  @ApiResponse({
    status: 201,
    description: 'University created successfully',
    type: UniversityResponseDto,
  })
  async create(@Body() createDto: CreateUniversityDto): Promise<UniversityResponseDto> {
    return this.universitiesService.createUniversity(createDto);
  }
}
