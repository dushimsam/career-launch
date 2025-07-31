import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  TableInheritance,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsEnum, IsOptional, Length } from 'class-validator';
import { UserStatus } from '../common/enums/user-status.enum';

@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class User {
  @ApiProperty({ description: 'Unique identifier for the user' })
  @PrimaryGeneratedColumn('uuid')
  userID: string;

  @ApiProperty({ description: 'User email address' })
  @Column({ unique: true, length: 255 })
  @Index('IDX_USER_EMAIL')
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ description: 'Full name of the user' })
  @Column({ length: 255 })
  @IsNotEmpty({ message: 'Name is required' })
  @Length(2, 255, { message: 'Name must be between 2 and 255 characters' })
  name: string;

  @ApiProperty({ description: 'Phone number of the user' })
  @Column({ length: 20, nullable: true })
  @IsOptional()
  @IsPhoneNumber(null, { message: 'Please provide a valid phone number' })
  phoneNumber?: string;

  @ApiProperty({ description: 'Hashed password' })
  @Column()
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 255, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ description: 'Profile picture URL' })
  @Column({ nullable: true })
  profilePictureURL?: string;

  @ApiProperty({ description: 'Whether the user email is verified' })
  @Column({ default: false })
  isVerified: boolean;

  @ApiProperty({ description: 'Email verification token' })
  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  verificationToken?: string;

  @ApiProperty({ description: 'Password reset token' })
  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  resetPasswordToken?: string;

  @ApiProperty({ description: 'Password reset token expiry' })
  @Column({ type: 'timestamp', nullable: true })
  @Exclude({ toPlainOnly: true })
  resetPasswordExpires?: Date;

  @ApiProperty({ 
    description: 'User account status',
    enum: UserStatus,
    default: UserStatus.ACTIVE 
  })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  @Index('IDX_USER_STATUS')
  @IsEnum(UserStatus, { message: 'Invalid user status' })
  status: UserStatus;

  @ApiProperty({ description: 'When the user account was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the user account was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Last login timestamp' })
  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @ApiProperty({ description: 'GitHub OAuth ID' })
  @Column({ nullable: true })
  @Index('IDX_USER_GITHUB_ID')
  githubId?: string;

  @ApiProperty({ description: 'Whether two-factor authentication is enabled' })
  @Column({ default: false })
  twoFactorEnabled: boolean;

  @ApiProperty({ description: 'Two-factor authentication secret' })
  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  twoFactorSecret?: string;
}
