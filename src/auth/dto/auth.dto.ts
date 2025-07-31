import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '+250123456789', required: false })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ 
    example: 'student',
    enum: ['student', 'recruiter', 'university_admin', 'platform_admin'],
    description: 'Type of user account to create'
  })
  @IsNotEmpty()
  @IsEnum(['student', 'recruiter', 'university_admin', 'platform_admin'])
  userType: string;

  @ApiProperty({ example: 'company-uuid', required: false, description: 'Required for recruiters' })
  @IsOptional()
  companyID?: string;

  @ApiProperty({ example: 'university-uuid', required: false, description: 'Required for university admins and students' })
  @IsOptional()
  universityID?: string;

  @ApiProperty({ example: 'CS001', required: false, description: 'Student ID (for students)' })
  @IsOptional()
  studentID?: string;

  @ApiProperty({ example: 'REC001', required: false, description: 'Recruiter ID (for recruiters)' })
  @IsOptional()
  recruiterID?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset-token-here' })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'newpassword123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({ example: 'verification-token-here' })
  @IsNotEmpty()
  token: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldpassword123' })
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'newpassword123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  user: {
    userID: string;
    email: string;
    name: string;
    type: string;
    isVerified: boolean;
  };
}
