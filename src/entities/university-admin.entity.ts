import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  ChildEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { University } from './university.entity';
import { AccessLevel } from '../common/enums/user-status.enum';

@ChildEntity()
export class UniversityAdmin extends User {
  @ApiProperty({ description: 'Unique university admin identifier' })
  @Column({ unique: true, length: 50 })
  universityAdminID: string;

  @ApiProperty({ description: 'Admin permissions within the platform' })
  @Column('simple-array', { nullable: true })
  permissions?: string[];

  @ApiProperty({ 
    description: 'Access level of the university admin',
    enum: AccessLevel 
  })
  @Column({
    type: 'enum',
    enum: AccessLevel,
    default: AccessLevel.BASIC,
  })
  accessLevel: AccessLevel;

  @ApiProperty({ description: 'Admin position/title' })
  @Column({ nullable: true })
  position?: string;

  @ApiProperty({ description: 'Department the admin works in' })
  @Column({ nullable: true })
  department?: string;

  @ApiProperty({ description: 'Whether the admin can verify students' })
  @Column({ default: true })
  canVerifyStudents: boolean;

  @ApiProperty({ description: 'Whether the admin can manage university profile' })
  @Column({ default: false })
  canManageUniversity: boolean;

  @ApiProperty({ description: 'Whether the admin can view placement statistics' })
  @Column({ default: true })
  canViewPlacements: boolean;

  @ApiProperty({ description: 'Whether the admin can share job opportunities' })
  @Column({ default: true })
  canShareJobs: boolean;

  @ApiProperty({ description: 'Admin contact extension' })
  @Column({ nullable: true })
  extension?: string;

  @ApiProperty({ description: 'Office location within the university' })
  @Column({ nullable: true })
  officeLocation?: string;

  // Relations
  @ApiProperty({ description: 'University the admin belongs to' })
  @ManyToOne(() => University, (university) => university.admins, {
    nullable: false,
  })
  @JoinColumn({ name: 'universityID' })
  university: University;

  @Column()
  universityID: string;
}
