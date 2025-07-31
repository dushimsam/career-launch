import {
  Entity,
  Column,
  ChildEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { AccessLevel } from '../common/enums/user-status.enum';

@ChildEntity()
export class PlatformAdmin extends User {
  @ApiProperty({ description: 'Unique platform admin identifier' })
  @Column({ unique: true, length: 50 })
  platformAdminID: string;

  @ApiProperty({ description: 'Admin permissions within the platform' })
  @Column('simple-array', { nullable: true })
  permissions?: string[];

  @ApiProperty({ 
    description: 'Access level of the platform admin',
    enum: AccessLevel 
  })
  @Column({
    type: 'enum',
    enum: AccessLevel,
    default: AccessLevel.ADMIN,
  })
  accessLevel: AccessLevel;

  @ApiProperty({ description: 'Admin role/title' })
  @Column({ nullable: true })
  role?: string;

  @ApiProperty({ description: 'Whether the admin can manage all users' })
  @Column({ default: false })
  canManageUsers: boolean;

  @ApiProperty({ description: 'Whether the admin can manage companies' })
  @Column({ default: false })
  canManageCompanies: boolean;

  @ApiProperty({ description: 'Whether the admin can manage universities' })
  @Column({ default: false })
  canManageUniversities: boolean;

  @ApiProperty({ description: 'Whether the admin can view system reports' })
  @Column({ default: true })
  canViewReports: boolean;

  @ApiProperty({ description: 'Whether the admin can moderate content' })
  @Column({ default: true })
  canModerateContent: boolean;

  @ApiProperty({ description: 'Whether the admin can manage system settings' })
  @Column({ default: false })
  canManageSystem: boolean;

  @ApiProperty({ description: 'Areas of responsibility' })
  @Column('simple-array', { nullable: true })
  responsibilities?: string[];

  @ApiProperty({ description: 'Admin notes or additional info' })
  @Column('text', { nullable: true })
  notes?: string;
}
