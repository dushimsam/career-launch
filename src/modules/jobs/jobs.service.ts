import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Job } from '../../entities/job.entity';
import { Company } from '../../entities/company.entity';
import { Recruiter } from '../../entities/recruiter.entity';
import { Application } from '../../entities/application.entity';
import { Student } from '../../entities/student.entity';
import { 
  CreateJobDto, 
  UpdateJobDto, 
  JobSearchDto,
  JobResponseDto 
} from './dto/job.dto';
import { JobStatus } from '../../common/enums/user-status.enum';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Recruiter)
    private recruiterRepository: Repository<Recruiter>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async create(createDto: CreateJobDto, recruiterID: string): Promise<JobResponseDto> {
    const recruiter = await this.recruiterRepository.findOne({
      where: { userID: recruiterID },
      relations: ['company'],
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter not found');
    }

    const job = this.jobRepository.create({
      ...createDto,
      companyID: recruiter.companyID,
      recruiterID,
      status: JobStatus.ACTIVE,
      deadline: createDto.deadline ? new Date(createDto.deadline) : null,
    });

    const savedJob = await this.jobRepository.save(job);
    return this.findById(savedJob.jobID);
  }

  async findAll(searchDto: JobSearchDto): Promise<{
    jobs: JobResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      q,
      location,
      industry,
      jobType,
      experienceLevel,
      isRemote,
      skills,
      minSalary,
      maxSalary,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = searchDto;

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.recruiter', 'recruiter')
      .where('job.status = :status', { status: JobStatus.ACTIVE });

    // Text search
    if (q) {
      queryBuilder.andWhere(
        '(job.title ILIKE :query OR job.description ILIKE :query OR job.category ILIKE :query)',
        { query: `%${q}%` }
      );
    }

    // Location filter
    if (location && !isRemote) {
      queryBuilder.andWhere('job.location ILIKE :location', { location: `%${location}%` });
    }

    // Industry filter
    if (industry) {
      queryBuilder.andWhere('company.industry ILIKE :industry', { industry: `%${industry}%` });
    }

    // Job type filter
    if (jobType) {
      queryBuilder.andWhere('job.jobType = :jobType', { jobType });
    }

    // Experience level filter
    if (experienceLevel) {
      queryBuilder.andWhere('job.experienceLevel = :experienceLevel', { experienceLevel });
    }

    // Remote work filter
    if (isRemote) {
      queryBuilder.andWhere('(job.isRemote = true OR job.isHybrid = true)');
    }

    // Skills filter
    if (skills && skills.length > 0) {
      queryBuilder.andWhere('job.skillsRequired && :skills', { skills });
    }

    // Salary filters
    if (minSalary) {
      queryBuilder.andWhere("(job.salary->>'min')::int >= :minSalary", { minSalary });
    }

    if (maxSalary) {
      queryBuilder.andWhere("(job.salary->>'max')::int <= :maxSalary", { maxSalary });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply sorting and pagination
    const jobs = await queryBuilder
      .orderBy(`job.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      jobs: jobs.map(job => this.toResponseDto(job)),
      total,
      page,
      totalPages,
    };
  }

  async findById(jobID: string): Promise<JobResponseDto> {
    const job = await this.jobRepository.findOne({
      where: { jobID },
      relations: ['company', 'recruiter'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return this.toResponseDto(job);
  }

  async update(jobID: string, updateDto: UpdateJobDto, recruiterID: string): Promise<JobResponseDto> {
    const job = await this.jobRepository.findOne({
      where: { jobID },
      relations: ['recruiter'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.recruiterID !== recruiterID) {
      throw new ForbiddenException('You can only update your own job postings');
    }

    Object.keys(updateDto).forEach(key => {
      if (updateDto[key] !== undefined) {
        if (key === 'deadline' && updateDto[key]) {
          job[key] = new Date(updateDto[key]);
        } else {
          job[key] = updateDto[key];
        }
      }
    });

    await this.jobRepository.save(job);
    return this.findById(jobID);
  }

  async publishJob(jobID: string, recruiterID: string): Promise<JobResponseDto> {
    const job = await this.jobRepository.findOne({
      where: { jobID },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.recruiterID !== recruiterID) {
      throw new ForbiddenException('You can only publish your own job postings');
    }

    job.status = JobStatus.ACTIVE;
    job.publishedAt = new Date();

    await this.jobRepository.save(job);
    return this.findById(jobID);
  }

  async closeJob(jobID: string, recruiterID: string): Promise<JobResponseDto> {
    const job = await this.jobRepository.findOne({
      where: { jobID },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.recruiterID !== recruiterID) {
      throw new ForbiddenException('You can only close your own job postings');
    }

    job.status = JobStatus.CLOSED;
    job.closedAt = new Date();

    await this.jobRepository.save(job);
    return this.findById(jobID);
  }

  async deleteJob(jobID: string, recruiterID: string): Promise<{ message: string }> {
    const job = await this.jobRepository.findOne({
      where: { jobID },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.recruiterID !== recruiterID) {
      throw new ForbiddenException('You can only delete your own job postings');
    }

    // Check if there are any applications
    const applicationCount = await this.applicationRepository.count({
      where: { jobID },
    });

    if (applicationCount > 0) {
      throw new BadRequestException('Cannot delete job with existing applications. Close the job instead.');
    }

    await this.jobRepository.remove(job);
    return { message: 'Job deleted successfully' };
  }

  async getJobApplications(
    jobID: string, 
    recruiterID: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const job = await this.jobRepository.findOne({
      where: { jobID },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.recruiterID !== recruiterID) {
      throw new ForbiddenException('You can only view applications for your own job postings');
    }

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.student', 'student')
      .where('application.jobID = :jobID', { jobID });

    if (status) {
      queryBuilder.andWhere('application.status = :status', { status });
    }

    const total = await queryBuilder.getCount();
    
    const applications = await queryBuilder
      .orderBy('application.appliedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      applications,
      total,
      page,
      totalPages,
    };
  }

  async getJobRecommendations(studentID: string, limit: number = 10): Promise<JobResponseDto[]> {
    const student = await this.studentRepository.findOne({
      where: { userID: studentID },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const studentSkills = student.skills || [];
    const studentPreferences = student.jobPreferences || {};

    // Type the preferences properly
    interface JobPreferences {
      jobTypes?: string[];
      remoteWork?: boolean;
      locations?: string[];
      industries?: string[];
    }
    const preferences = studentPreferences as JobPreferences;

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.recruiter', 'recruiter')
      .where('job.status = :status', { status: JobStatus.ACTIVE });

    // Skills-based matching
    if (studentSkills.length > 0) {
      queryBuilder.andWhere(
        'job.skillsRequired && :skills OR job.description ILIKE ANY(:skillPatterns)',
        {
          skills: studentSkills,
          skillPatterns: studentSkills.map(skill => `%${skill}%`),
        }
      );
    }

    // Job preferences matching
    if (preferences.jobTypes?.length > 0) {
      queryBuilder.andWhere('job.jobType = ANY(:jobTypes)', { 
        jobTypes: preferences.jobTypes 
      });
    }

    if (preferences.remoteWork) {
      queryBuilder.andWhere('(job.isRemote = true OR job.isHybrid = true)');
    }

    if (preferences.locations?.length > 0 && !preferences.remoteWork) {
      queryBuilder.andWhere('job.location = ANY(:locations)', { 
        locations: preferences.locations 
      });
    }

    if (preferences.industries?.length > 0) {
      queryBuilder.andWhere('company.industry = ANY(:industries)', { 
        industries: preferences.industries 
      });
    }

    // Exclude jobs the student has already applied to
    const appliedJobIDs = await this.applicationRepository
      .createQueryBuilder('application')
      .select('application.jobID')
      .where('application.studentID = :studentID', { studentID })
      .getRawMany();

    if (appliedJobIDs.length > 0) {
      const jobIDs = appliedJobIDs.map(app => app.jobID);
      queryBuilder.andWhere('job.jobID NOT IN (:...jobIDs)', { jobIDs });
    }

    const jobs = await queryBuilder
      .orderBy('job.createdAt', 'DESC')
      .limit(limit)
      .getMany();

    return jobs.map(job => this.toResponseDto(job));
  }

  async getFeaturedJobs(limit: number = 6): Promise<JobResponseDto[]> {
    const jobs = await this.jobRepository.find({
      where: { 
        status: JobStatus.ACTIVE,
        isFeatured: true 
      },
      relations: ['company', 'recruiter'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return jobs.map(job => this.toResponseDto(job));
  }

  async getJobStats(): Promise<{
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    avgApplicationsPerJob: number;
    topCategories: Array<{ category: string; count: number }>;
    jobsByType: Array<{ type: string; count: number }>;
  }> {
    const totalJobs = await this.jobRepository.count();
    const activeJobs = await this.jobRepository.count({
      where: { status: JobStatus.ACTIVE },
    });

    const totalApplications = await this.applicationRepository.count();
    const avgApplicationsPerJob = totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0;

    // Top categories
    const categoryStats = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('job.category IS NOT NULL')
      .groupBy('job.category')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const topCategories = categoryStats.map(stat => ({
      category: stat.category,
      count: parseInt(stat.count),
    }));

    // Jobs by type
    const typeStats = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.jobType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('job.jobType')
      .orderBy('count', 'DESC')
      .getRawMany();

    const jobsByType = typeStats.map(stat => ({
      type: stat.type,
      count: parseInt(stat.count),
    }));

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      avgApplicationsPerJob,
      topCategories,
      jobsByType,
    };
  }

  private toResponseDto(job: Job): JobResponseDto {
    return {
      jobID: job.jobID,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      skillsRequired: job.skillsRequired,
      experienceLevel: job.experienceLevel,
      jobType: job.jobType,
      salary: job.salary,
      location: job.location,
      isRemote: job.isRemote,
      isHybrid: job.isHybrid,
      status: job.status,
      deadline: job.deadline,
      benefits: job.benefits,
      responsibilities: job.responsibilities,
      educationRequirement: job.educationRequirement,
      experienceYears: job.experienceYears,
      category: job.category,
      tags: job.tags,
      positions: job.positions,
      applicationCount: job.applicationCount,
      priority: job.priority,
      isFeatured: job.isFeatured,
      company: job.company ? {
        companyID: job.company.companyID,
        name: job.company.name,
        logoURL: job.company.logoURL,
        location: job.company.location,
        industry: job.company.industry,
        size: job.company.size,
      } : null,
      recruiter: job.recruiter ? {
        userID: job.recruiter.userID,
        name: job.recruiter.name,
        position: job.recruiter.position,
      } : null,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      publishedAt: job.publishedAt,
    };
  }
}
