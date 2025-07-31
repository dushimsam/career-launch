import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsPhoneNumber, IsUrl } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  profilePictureURL?: string;
}

export class UpdateUserSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  emailNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  smsNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  jobRecommendations?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  applicationUpdates?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  marketingEmails?: boolean;
}

export class UserResponseDto {
  @ApiProperty()
  userID: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phoneNumber?: string;

  @ApiProperty()
  profilePictureURL?: string;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  lastLogin?: Date;

  @ApiProperty()
  type: string;
}
