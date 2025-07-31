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
import { Student } from './student.entity';
import { Project } from './project.entity';
import { PortfolioType } from '../common/enums/user-status.enum';

@Entity('portfolios')
export class Portfolio {
  @ApiProperty({ description: 'Unique identifier for the portfolio' })
  @PrimaryGeneratedColumn('uuid')
  portfolioID: string;

  @ApiProperty({ 
    description: 'Platform/type of portfolio',
    enum: PortfolioType 
  })
  @Column({
    type: 'enum',
    enum: PortfolioType,
  })
  platform: PortfolioType;

  @ApiProperty({ description: 'URL to the portfolio profile' })
  @Column()
  profileURL: string;

  @ApiProperty({ description: 'Whether the portfolio is verified' })
  @Column({ default: false })
  isVerified: boolean;

  @ApiProperty({ description: 'When the portfolio was last synced' })
  @Column({ type: 'timestamp', nullable: true })
  lastSynced?: Date;

  @ApiProperty({ description: 'Portfolio title/name' })
  @Column({ nullable: true })
  title?: string;

  @ApiProperty({ description: 'Portfolio description' })
  @Column('text', { nullable: true })
  description?: string;

  @ApiProperty({ description: 'Portfolio metadata from external platform' })
  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Portfolio statistics' })
  @Column('json', { nullable: true })
  statistics?: {
    totalProjects?: number;
    totalStars?: number;
    totalForks?: number;
    totalFollowers?: number;
    totalViews?: number;
    languages?: Record<string, number>;
  };

  @ApiProperty({ description: 'Sync status and error messages' })
  @Column('json', { nullable: true })
  syncStatus?: {
    status: string;
    lastError?: string;
    lastSuccessfulSync?: Date;
  };

  @ApiProperty({ description: 'Auto-sync enabled' })
  @Column({ default: true })
  autoSync: boolean;

  @ApiProperty({ description: 'Portfolio visibility settings' })
  @Column({ default: true })
  isPublic: boolean;

  @ApiProperty({ description: 'Portfolio featured status' })
  @Column({ default: false })
  isFeatured: boolean;

  @ApiProperty({ description: 'When the portfolio record was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the portfolio record was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ApiProperty({ description: 'Student who owns this portfolio' })
  @ManyToOne(() => Student, (student) => student.portfolios, {
    nullable: false,
  })
  @JoinColumn({ name: 'studentID' })
  student: Student;

  @Column()
  studentID: string;

  @ApiProperty({ description: 'Projects in this portfolio' })
  @OneToMany(() => Project, (project) => project.portfolio, {
    cascade: true,
  })
  projects: Project[];
}
