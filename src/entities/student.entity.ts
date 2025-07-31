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
import { University } from './university.entity';
import { Portfolio } from './portfolio.entity';
import { Application } from './application.entity';
import { AcademicLevel } from '../common/enums/user-status.enum';

@ChildEntity()
export class Student extends User {
  @ApiProperty({ description: 'Unique student identifier' })
  @Column({ unique: true, length: 50 })
  studentID: string;

  @ApiProperty({ description: 'Student GPA' })
  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  GPA?: number;

  @ApiProperty({ description: 'Expected graduation year' })
  @Column({ nullable: true })
  graduationYear?: number;

  @ApiProperty({ description: 'Student skills' })
  @Column('simple-array', { nullable: true })
  skills?: string[];

  @ApiProperty({ description: 'Resume file URL' })
  @Column({ nullable: true })
  resumeURL?: string;

  @ApiProperty({ description: 'Portfolio links and descriptions' })
  @Column('json', { nullable: true })
  portfolioLinks?: Array<{
    platform: string;
    url: string;
    description?: string;
  }>;

  @ApiProperty({ 
    description: 'Academic level',
    enum: AcademicLevel 
  })
  @Column({
    type: 'enum',
    enum: AcademicLevel,
    nullable: true,
  })
  academicLevel?: AcademicLevel;

  @ApiProperty({ description: 'Student major/field of study' })
  @Column({ nullable: true })
  major?: string;

  @ApiProperty({ description: 'Student minor (if applicable)' })
  @Column({ nullable: true })
  minor?: string;

  @ApiProperty({ description: 'Student bio/summary' })
  @Column('text', { nullable: true })
  bio?: string;

  @ApiProperty({ description: 'Programming languages known' })
  @Column('simple-array', { nullable: true })
  programmingLanguages?: string[];

  @ApiProperty({ description: 'Frameworks and tools known' })
  @Column('simple-array', { nullable: true })
  frameworks?: string[];

  @ApiProperty({ description: 'Certifications earned' })
  @Column('json', { nullable: true })
  certifications?: Array<{
    name: string;
    issuer: string;
    date: Date;
    url?: string;
  }>;

  @ApiProperty({ description: 'Work experience' })
  @Column('json', { nullable: true })
  workExperience?: Array<{
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    description: string;
    skills: string[];
  }>;

  @ApiProperty({ description: 'Notable projects' })
  @Column('json', { nullable: true })
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    githubUrl?: string;
  }>;

  @ApiProperty({ description: 'Job preferences' })
  @Column('json', { nullable: true })
  jobPreferences?: {
    jobTypes: string[];
    locations: string[];
    salaryRange: {
      min?: number;
      max?: number;
      currency: string;
    };
    remoteWork: boolean;
    industries: string[];
  };

  // Relations
  @ApiProperty({ description: 'University the student belongs to' })
  @ManyToOne(() => University, (university) => university.students, {
    nullable: true,
  })
  @JoinColumn({ name: 'universityID' })
  university?: University;

  @Column({ nullable: true })
  universityID?: string;

  @ApiProperty({ description: 'Student portfolios' })
  @OneToMany(() => Portfolio, (portfolio) => portfolio.student)
  portfolios: Portfolio[];

  @ApiProperty({ description: 'Student job applications' })
  @OneToMany(() => Application, (application) => application.student)
  applications: Application[];
}
