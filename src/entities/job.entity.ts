import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Company } from './company.entity';
import { Recruiter } from './recruiter.entity';
import { Application } from './application.entity';
import {
  JobType,
  ExperienceLevel,
  JobStatus,
} from '../common/enums/user-status.enum';

@Entity('jobs')
export class Job {
  @ApiProperty({ description: 'Unique identifier for the job' })
  @PrimaryGeneratedColumn('uuid')
  jobID: string;

  @ApiProperty({ description: 'Job title' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Detailed job description' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Job requirements' })
  @Column('simple-array', { nullable: true })
  requirements?: string[];

  @ApiProperty({ description: 'Skills required for the job' })
  @Column('simple-array', { nullable: true })
  skillsRequired?: string[];

  @ApiProperty({ 
    description: 'Required experience level',
    enum: ExperienceLevel 
  })
  @Column({
    type: 'enum',
    enum: ExperienceLevel,
    default: ExperienceLevel.ENTRY,
  })
  experienceLevel: ExperienceLevel;

  @ApiProperty({ 
    description: 'Type of job',
    enum: JobType 
  })
  @Column({
    type: 'enum',
    enum: JobType,
    default: JobType.FULL_TIME,
  })
  jobType: JobType;

  @ApiProperty({ description: 'Salary information' })
  @Column('json', { nullable: true })
  salary?: {
    min?: number;
    max?: number;
    currency: string;
    period?: string; // hourly, monthly, annually
  };

  @ApiProperty({ description: 'Job location' })
  @Column({ nullable: true })
  location?: string;

  @ApiProperty({ description: 'Whether the job supports remote work' })
  @Column({ default: false })
  isRemote: boolean;

  @ApiProperty({ description: 'Hybrid work options' })
  @Column({ default: false })
  isHybrid: boolean;

  @ApiProperty({ 
    description: 'Current status of the job posting',
    enum: JobStatus 
  })
  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.ACTIVE,
  })
  status: JobStatus;

  @ApiProperty({ description: 'Application deadline' })
  @Column({ type: 'timestamp', nullable: true })
  deadline?: Date;

  @ApiProperty({ description: 'Job benefits' })
  @Column('simple-array', { nullable: true })
  benefits?: string[];

  @ApiProperty({ description: 'Job responsibilities' })
  @Column('simple-array', { nullable: true })
  responsibilities?: string[];

  @ApiProperty({ description: 'Educational requirements' })
  @Column({ nullable: true })
  educationRequirement?: string;

  @ApiProperty({ description: 'Years of experience required' })
  @Column({ nullable: true })
  experienceYears?: number;

  @ApiProperty({ description: 'Job category/department' })
  @Column({ nullable: true })
  category?: string;

  @ApiProperty({ description: 'Job tags for better searchability' })
  @Column('simple-array', { nullable: true })
  tags?: string[];

  @ApiProperty({ description: 'Number of positions available' })
  @Column({ default: 1 })
  positions: number;

  @ApiProperty({ description: 'Number of applications received' })
  @Column({ default: 0 })
  applicationCount: number;

  @ApiProperty({ description: 'Job priority level' })
  @Column({ default: 0 })
  priority: number;

  @ApiProperty({ description: 'Whether job is featured' })
  @Column({ default: false })
  isFeatured: boolean;

  @ApiProperty({ description: 'External application URL if applicable' })
  @Column({ nullable: true })
  externalApplicationUrl?: string;

  @ApiProperty({ description: 'When the job was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the job was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'When the job was published' })
  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @ApiProperty({ description: 'When the job was closed' })
  @Column({ type: 'timestamp', nullable: true })
  closedAt?: Date;

  // Relations
  @ApiProperty({ description: 'Company that posted the job' })
  @ManyToOne(() => Company, (company) => company.jobs, {
    nullable: false,
  })
  @JoinColumn({ name: 'companyID' })
  company: Company;

  @Column()
  companyID: string;

  @ApiProperty({ description: 'Recruiter who posted the job' })
  @ManyToOne(() => Recruiter, (recruiter) => recruiter.jobs, {
    nullable: false,
  })
  @JoinColumn({ name: 'recruiterID' })
  recruiter: Recruiter;

  @Column()
  recruiterID: string;

  @ApiProperty({ description: 'Applications for this job' })
  @OneToMany(() => Application, (application) => application.job)
  applications: Application[];
}
