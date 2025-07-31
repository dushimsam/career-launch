import {
  Controller,
  Get,
  Put,
  Post,
  Body,
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
import { StudentsService } from './students.service';
import {
  UpdateStudentProfileDto,
  UpdateJobPreferencesDto,
  AddCertificationDto,
  AddWorkExperienceDto,
  AddProjectDto,
  StudentResponseDto,
} from './dto/student.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import * as multer from 'multer';
import { extname } from 'path';

@ApiTags('Students')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('student')
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get student profile' })
  @ApiResponse({
    status: 200,
    description: 'Student profile retrieved successfully',
    type: StudentResponseDto,
  })
  async getProfile(@Request() req): Promise<StudentResponseDto> {
    return this.studentsService.findByUserId(req.user.userID);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update student profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: StudentResponseDto,
  })
  async updateProfile(
    @Request() req,
    @Body() updateDto: UpdateStudentProfileDto
  ): Promise<StudentResponseDto> {
    return this.studentsService.updateProfile(req.user.userID, updateDto);
  }

  @Put('job-preferences')
  @ApiOperation({ summary: 'Update job preferences' })
  @ApiResponse({
    status: 200,
    description: 'Job preferences updated successfully',
    type: StudentResponseDto,
  })
  async updateJobPreferences(
    @Request() req,
    @Body() preferences: UpdateJobPreferencesDto
  ): Promise<StudentResponseDto> {
    return this.studentsService.updateJobPreferences(req.user.userID, preferences);
  }

  @Post('upload-resume')
  @ApiOperation({ summary: 'Upload resume' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Resume uploaded successfully',
    type: StudentResponseDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: './uploads/resumes',
        filename: (req: any, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, `${req.user?.userID}-resume-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
          return cb(new BadRequestException('Only PDF and DOC files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    })
  )
  async uploadResume(
    @Request() req,
    @UploadedFile() file: Express.Multer.File
  ): Promise<StudentResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileUrl = `/uploads/resumes/${file.filename}`;
    return this.studentsService.uploadResume(req.user.userID, fileUrl);
  }

  @Post('certifications')
  @ApiOperation({ summary: 'Add certification' })
  @ApiResponse({
    status: 200,
    description: 'Certification added successfully',
    type: StudentResponseDto,
  })
  async addCertification(
    @Request() req,
    @Body() certificationDto: AddCertificationDto
  ): Promise<StudentResponseDto> {
    return this.studentsService.addCertification(req.user.userID, certificationDto);
  }

  @Post('work-experience')
  @ApiOperation({ summary: 'Add work experience' })
  @ApiResponse({
    status: 200,
    description: 'Work experience added successfully',
    type: StudentResponseDto,
  })
  async addWorkExperience(
    @Request() req,
    @Body() workDto: AddWorkExperienceDto
  ): Promise<StudentResponseDto> {
    return this.studentsService.addWorkExperience(req.user.userID, workDto);
  }

  @Post('projects')
  @ApiOperation({ summary: 'Add project' })
  @ApiResponse({
    status: 200,
    description: 'Project added successfully',
    type: StudentResponseDto,
  })
  async addProject(
    @Request() req,
    @Body() projectDto: AddProjectDto
  ): Promise<StudentResponseDto> {
    return this.studentsService.addProject(req.user.userID, projectDto);
  }

  @Post('sync-github')
  @ApiOperation({ summary: 'Sync GitHub portfolio' })
  @ApiResponse({
    status: 200,
    description: 'GitHub portfolio synced successfully',
  })
  async syncGitHubPortfolio(
    @Request() req,
    @Body('username') githubUsername: string
  ) {
    return this.studentsService.syncGitHubPortfolio(req.user.userID, githubUsername);
  }

  @Get('applications')
  @ApiOperation({ summary: 'Get student applications' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by application status' })
  @ApiResponse({
    status: 200,
    description: 'Applications retrieved successfully',
  })
  async getApplications(
    @Request() req,
    @Query('status') status?: string
  ) {
    return this.studentsService.getApplications(req.user.userID, status);
  }

  @Get('job-recommendations')
  @ApiOperation({ summary: 'Get job recommendations' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of recommendations' })
  @ApiResponse({
    status: 200,
    description: 'Job recommendations retrieved successfully',
  })
  async getJobRecommendations(
    @Request() req,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number
  ) {
    return this.studentsService.getJobRecommendations(req.user.userID, limit);
  }

  @Get('profile-completion')
  @ApiOperation({ summary: 'Get profile completion score and suggestions' })
  @ApiResponse({
    status: 200,
    description: 'Profile completion data retrieved successfully',
  })
  async getProfileCompletion(@Request() req) {
    return this.studentsService.getProfileCompletionScore(req.user.userID);
  }
}
