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
import { Portfolio } from './portfolio.entity';

@Entity('projects')
export class Project {
  @ApiProperty({ description: 'Unique identifier for the project' })
  @PrimaryGeneratedColumn('uuid')
  projectID: string;

  @ApiProperty({ description: 'Project title' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Project description' })
  @Column('text', { nullable: true })
  description?: string;

  @ApiProperty({ description: 'Technologies/languages used in the project' })
  @Column('simple-array', { nullable: true })
  technologies?: string[];

  @ApiProperty({ description: 'Live project URL' })
  @Column({ nullable: true })
  projectURL?: string;

  @ApiProperty({ description: 'Repository URL (GitHub, GitLab, etc.)' })
  @Column({ nullable: true })
  repositoryURL?: string;

  @ApiProperty({ description: 'Project image URLs' })
  @Column('simple-array', { nullable: true })
  imageURLs?: string[];

  @ApiProperty({ description: 'Project demo video URL' })
  @Column({ nullable: true })
  videoURL?: string;

  @ApiProperty({ description: 'Project status' })
  @Column({ default: 'active' })
  status: string;

  @ApiProperty({ description: 'Project stars/likes count' })
  @Column({ default: 0 })
  starsCount: number;

  @ApiProperty({ description: 'Project forks count (for GitHub projects)' })
  @Column({ default: 0 })
  forksCount: number;

  @ApiProperty({ description: 'Project watchers count' })
  @Column({ default: 0 })
  watchersCount: number;

  @ApiProperty({ description: 'Project size in KB' })
  @Column({ nullable: true })
  size?: number;

  @ApiProperty({ description: 'Primary programming language' })
  @Column({ nullable: true })
  primaryLanguage?: string;

  @ApiProperty({ description: 'Language statistics' })
  @Column('json', { nullable: true })
  languageStats?: Record<string, number>;

  @ApiProperty({ description: 'Project topics/tags' })
  @Column('simple-array', { nullable: true })
  topics?: string[];

  @ApiProperty({ description: 'Project license' })
  @Column({ nullable: true })
  license?: string;

  @ApiProperty({ description: 'Whether the project is a fork' })
  @Column({ default: false })
  isFork: boolean;

  @ApiProperty({ description: 'Whether the project is private' })
  @Column({ default: false })
  isPrivate: boolean;

  @ApiProperty({ description: 'Project contribution statistics' })
  @Column('json', { nullable: true })
  contributionStats?: {
    commits: number;
    additions: number;
    deletions: number;
    contributors: number;
  };

  @ApiProperty({ description: 'External project metadata' })
  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'When the project was created on external platform' })
  @Column({ type: 'timestamp', nullable: true })
  externalCreatedAt?: Date;

  @ApiProperty({ description: 'When the project was last updated on external platform' })
  @Column({ type: 'timestamp', nullable: true })
  externalUpdatedAt?: Date;

  @ApiProperty({ description: 'When the project record was created in our system' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the project record was last updated in our system' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ApiProperty({ description: 'Portfolio this project belongs to' })
  @ManyToOne(() => Portfolio, (portfolio) => portfolio.projects, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'portfolioID' })
  portfolio: Portfolio;

  @Column()
  portfolioID: string;
}
