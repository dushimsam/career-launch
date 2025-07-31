import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Student } from './student.entity';
import { Job } from './job.entity';
import { ApplicationStatus } from '../common/enums/user-status.enum';

@Entity('applications')
export class Application {
  @ApiProperty({ description: 'Unique identifier for the application' })
  @PrimaryGeneratedColumn('uuid')
  applicationID: string;

  @ApiProperty({ 
    description: 'Current status of the application',
    enum: ApplicationStatus 
  })
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.SUBMITTED,
  })
  status: ApplicationStatus;

  @ApiProperty({ description: 'Cover letter for the application' })
  @Column('text', { nullable: true })
  coverLetter?: string;

  @ApiProperty({ description: 'When the application was submitted' })
  @CreateDateColumn()
  appliedAt: Date;

  @ApiProperty({ description: 'When the application was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Application status history' })
  @Column('json', { nullable: true })
  statusHistory?: Array<{
    status: ApplicationStatus;
    timestamp: Date;
    notes?: string;
    updatedBy?: string;
  }>;

  @ApiProperty({ description: 'Recruiter notes on the application' })
  @Column('text', { nullable: true })
  recruiterNotes?: string;

  @ApiProperty({ description: 'Student notes on the application' })
  @Column('text', { nullable: true })
  studentNotes?: string;

  @ApiProperty({ description: 'Interview scheduling information' })
  @Column('json', { nullable: true })
  interviewInfo?: {
    scheduledDate?: Date;
    interviewType?: string; // phone, video, in-person
    location?: string;
    interviewerName?: string;
    interviewerEmail?: string;
    notes?: string;
  };

  @ApiProperty({ description: 'Application score or rating (0-100)' })
  @Column({ nullable: true })
  score?: number;

  @ApiProperty({ description: 'Rejection reason if applicable' })
  @Column({ nullable: true })
  rejectionReason?: string;

  @ApiProperty({ description: 'Additional documents uploaded' })
  @Column('json', { nullable: true })
  additionalDocuments?: Array<{
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }>;

  @ApiProperty({ description: 'Expected salary from student' })
  @Column('json', { nullable: true })
  expectedSalary?: {
    amount: number;
    currency: string;
    period: string;
  };

  @ApiProperty({ description: 'Availability start date' })
  @Column({ type: 'date', nullable: true })
  availabilityDate?: Date;

  @ApiProperty({ description: 'Application priority flag' })
  @Column({ default: false })
  isPriority: boolean;

  @ApiProperty({ description: 'Whether the application is shortlisted' })
  @Column({ default: false })
  isShortlisted: boolean;

  @ApiProperty({ description: 'Feedback from interview' })
  @Column('text', { nullable: true })
  interviewFeedback?: string;

  @ApiProperty({ description: 'Skills match percentage with job requirements' })
  @Column({ nullable: true })
  skillsMatchPercentage?: number;

  // Relations
  @ApiProperty({ description: 'Student who submitted the application' })
  @ManyToOne(() => Student, (student) => student.applications, {
    nullable: false,
  })
  @JoinColumn({ name: 'studentID' })
  student: Student;

  @Column()
  studentID: string;

  @ApiProperty({ description: 'Job for which the application was submitted' })
  @ManyToOne(() => Job, (job) => job.applications, {
    nullable: false,
  })
  @JoinColumn({ name: 'jobID' })
  job: Job;

  @Column()
  jobID: string;
}
