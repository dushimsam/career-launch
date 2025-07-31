import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ChildEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Company } from './company.entity';
import { Job } from './job.entity';

@ChildEntity()
export class Recruiter extends User {
  @ApiProperty({ description: 'Unique recruiter identifier' })
  @Column({ unique: true, length: 50 })
  recruiterID: string;

  @ApiProperty({ description: 'Recruiter position/title' })
  @Column({ nullable: true })
  position?: string;

  @ApiProperty({ description: 'Department the recruiter works in' })
  @Column({ nullable: true })
  department?: string;

  @ApiProperty({ description: 'Recruiter permissions within the platform' })
  @Column('simple-array', { nullable: true })
  permissions?: string[];

  @ApiProperty({ description: 'Recruiter bio/description' })
  @Column('text', { nullable: true })
  bio?: string;

  @ApiProperty({ description: 'Specializations or focus areas' })
  @Column('simple-array', { nullable: true })
  specializations?: string[];

  @ApiProperty({ description: 'Years of recruiting experience' })
  @Column({ nullable: true })
  experienceYears?: number;

  @ApiProperty({ description: 'LinkedIn profile URL' })
  @Column({ nullable: true })
  linkedinURL?: string;

  @ApiProperty({ description: 'Whether the recruiter can post jobs' })
  @Column({ default: true })
  canPostJobs: boolean;

  @ApiProperty({ description: 'Whether the recruiter can view applications' })
  @Column({ default: true })
  canViewApplications: boolean;

  @ApiProperty({ description: 'Whether the recruiter can interview candidates' })
  @Column({ default: false })
  canInterview: boolean;

  @ApiProperty({ description: 'Maximum number of jobs recruiter can post' })
  @Column({ nullable: true })
  jobPostLimit?: number;

  @ApiProperty({ description: 'Recruiter preferences for candidate filtering' })
  @Column('json', { nullable: true })
  candidatePreferences?: {
    experienceLevels: string[];
    skills: string[];
    educationLevels: string[];
    locations: string[];
  };

  // Relations
  @ApiProperty({ description: 'Company the recruiter works for' })
  @ManyToOne(() => Company, (company) => company.recruiters, {
    nullable: false,
  })
  @JoinColumn({ name: 'companyID' })
  company: Company;

  @Column()
  companyID: string;

  @ApiProperty({ description: 'Jobs posted by this recruiter' })
  @OneToMany(() => Job, (job) => job.recruiter)
  jobs: Job[];
}
