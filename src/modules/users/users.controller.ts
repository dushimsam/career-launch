import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateUserProfileDto, UserResponseDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import * as multer from 'multer';
import { extname } from 'path';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  async getProfile(@Request() req): Promise<UserResponseDto> {
    return this.usersService.findById(req.user.userID);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics and profile completion' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
  })
  async getUserStats(@Request() req) {
    return this.usersService.getUserStats(req.user.userID);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  async updateProfile(
    @Request() req,
    @Body() updateDto: UpdateUserProfileDto
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(req.user.userID, updateDto);
  }

  @Put('profile-picture')
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Profile picture uploaded successfully',
    type: UserResponseDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: './uploads/profiles',
        filename: (req: any, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, `${req.user?.userID}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    })
  )
  async uploadProfilePicture(
    @Request() req,
    @UploadedFile() file: Express.Multer.File
  ): Promise<UserResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // In a real application, you would upload to cloud storage (AWS S3, etc.)
    const fileUrl = `/uploads/profiles/${file.filename}`;
    return this.usersService.uploadProfilePicture(req.user.userID, fileUrl);
  }

  @Put('deactivate')
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({
    status: 200,
    description: 'Account deactivated successfully',
  })
  async deactivateAccount(@Request() req) {
    return this.usersService.deactivateAccount(req.user.userID);
  }

  @Put('reactivate')
  @ApiOperation({ summary: 'Reactivate user account' })
  @ApiResponse({
    status: 200,
    description: 'Account reactivated successfully',
  })
  async reactivateAccount(@Request() req) {
    return this.usersService.reactivateAccount(req.user.userID);
  }

  @Delete('account')
  @ApiOperation({ summary: 'Delete user account (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
  })
  async deleteAccount(@Request() req) {
    return this.usersService.deleteAccount(req.user.userID);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({ name: 'type', required: false, description: 'User type filter' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Users found successfully',
  })
  async searchUsers(
    @Query('q') query?: string,
    @Query('type') userType?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.usersService.searchUsers(query, userType, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(@Param('id') userId: string): Promise<UserResponseDto> {
    return this.usersService.findById(userId);
  }

  // Admin-only endpoints
  @Get()
  @UseGuards(RolesGuard)
  @Roles('platformadmin')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, description: 'User type filter' })
  @ApiQuery({ name: 'status', required: false, description: 'User status filter' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('type') userType?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.getAllUsers(page, limit, userType, status);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('platformadmin')
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
  })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body('status') status: string
  ) {
    return this.usersService.updateUserStatus(userId, status);
  }
}
