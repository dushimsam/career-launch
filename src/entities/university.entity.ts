import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Student } from './student.entity';
import { UniversityAdmin } from './university-admin.entity';
import { VerificationStatus } from '../common/enums/user-status.enum';

@Entity('universities')
export class University {
  @ApiProperty({ description: 'Unique identifier for the university' })
  @PrimaryGeneratedColumn('uuid')
  universityID: string;

  @ApiProperty({ description: 'Name of the university' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'University description' })
  @Column('text', { nullable: true })
  description?: string;

  @ApiProperty({ description: 'University location' })
  @Column({ length: 255 })
  location: string;

  @ApiProperty({ description: 'University website URL' })
  @Column({ nullable: true })
  website?: string;

  @ApiProperty({ description: 'University logo URL' })
  @Column({ nullable: true })
  logoURL?: string;

  @ApiProperty({ description: 'University contact email' })
  @Column({ nullable: true })
  contactEmail?: string;

  @ApiProperty({ description: 'University contact phone' })
  @Column({ nullable: true })
  contactPhone?: string;

  @ApiProperty({ 
    description: 'University verification status',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING 
  })
  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @ApiProperty({ description: 'University ranking (if available)' })
  @Column({ nullable: true })
  ranking?: number;

  @ApiProperty({ description: 'Year the university was established' })
  @Column({ nullable: true })
  establishedYear?: number;

  @ApiProperty({ description: 'Total student count' })
  @Column({ default: 0 })
  studentCount: number;

  @ApiProperty({ description: 'University accreditation info' })
  @Column('json', { nullable: true })
  accreditations?: Record<string, any>;

  @ApiProperty({ description: 'Available programs/majors' })
  @Column('simple-array', { nullable: true })
  programs?: string[];

  @ApiProperty({ description: 'When the university record was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the university record was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ApiProperty({ description: 'Students associated with this university' })
  @OneToMany(() => Student, (student) => student.university)
  students: Student[];

  @ApiProperty({ description: 'Administrators of this university' })
  @OneToMany(() => UniversityAdmin, (admin) => admin.university)
  admins: UniversityAdmin[];
}
