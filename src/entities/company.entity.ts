import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Recruiter } from './recruiter.entity';
import { Job } from './job.entity';
import { CompanySize, VerificationStatus } from '../common/enums/user-status.enum';

@Entity('companies')
export class Company {
  @ApiProperty({ description: 'Unique identifier for the company' })
  @PrimaryGeneratedColumn('uuid')
  companyID: string;

  @ApiProperty({ description: 'Company name' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Company description' })
  @Column('text', { nullable: true })
  description?: string;

  @ApiProperty({ 
    description: 'Company size category',
    enum: CompanySize 
  })
  @Column({
    type: 'enum',
    enum: CompanySize,
    nullable: true,
  })
  size?: CompanySize;

  @ApiProperty({ description: 'Company industry' })
  @Column({ nullable: true })
  industry?: string;

  @ApiProperty({ description: 'Company headquarters location' })
  @Column({ nullable: true })
  location?: string;

  @ApiProperty({ description: 'Company website URL' })
  @Column({ nullable: true })
  website?: string;

  @ApiProperty({ description: 'Company logo URL' })
  @Column({ nullable: true })
  logoURL?: string;

  @ApiProperty({ description: 'Company contact email' })
  @Column({ nullable: true })
  contactEmail?: string;

  @ApiProperty({ description: 'Company contact phone' })
  @Column({ nullable: true })
  contactPhone?: string;

  @ApiProperty({ 
    description: 'Company verification status',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING 
  })
  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @ApiProperty({ description: 'Year the company was founded' })
  @Column({ nullable: true })
  foundedYear?: number;

  @ApiProperty({ description: 'Number of employees' })
  @Column({ nullable: true })
  employeeCount?: number;

  @ApiProperty({ description: 'Company culture and values' })
  @Column('json', { nullable: true })
  culture?: Record<string, any>;

  @ApiProperty({ description: 'Company benefits offered' })
  @Column('simple-array', { nullable: true })
  benefits?: string[];

  @ApiProperty({ description: 'Company technologies used' })
  @Column('simple-array', { nullable: true })
  technologies?: string[];

  @ApiProperty({ description: 'Company social media links' })
  @Column('json', { nullable: true })
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };

  @ApiProperty({ description: 'Company mission statement' })
  @Column('text', { nullable: true })
  mission?: string;

  @ApiProperty({ description: 'Company vision statement' })
  @Column('text', { nullable: true })
  vision?: string;

  @ApiProperty({ description: 'Company values' })
  @Column('simple-array', { nullable: true })
  values?: string[];

  @ApiProperty({ description: 'When the company record was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the company record was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ApiProperty({ description: 'Recruiters associated with this company' })
  @OneToMany(() => Recruiter, (recruiter) => recruiter.company)
  recruiters: Recruiter[];

  @ApiProperty({ description: 'Jobs posted by this company' })
  @OneToMany(() => Job, (job) => job.company)
  jobs: Job[];
}
