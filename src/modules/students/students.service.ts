import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../../entities/student.entity';
import { Portfolio } from '../../entities/portfolio.entity';
import { Application } from '../../entities/application.entity';
import { Job } from '../../entities/job.entity';
import { 
  UpdateStudentProfileDto,
  UpdateJobPreferencesDto,
  AddCertificationDto,
  AddWorkExperienceDto,
  AddProjectDto,
  StudentResponseDto
} from './dto/student.dto';
import { GitHubService } from '../../external/github.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private githubService: GitHubService,
  ) {}

  async findByUserId(userId: string): Promise<StudentResponseDto> {
    const student = await this.studentRepository.findOne({
      where: { userID: userId },
      relations: ['university', 'portfolios', 'applications'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return this.toResponseDto(student);
  }

  async updateProfile(userId: string, updateDto: UpdateStudentProfileDto): Promise<StudentResponseDto> {
    const student = await this.studentRepository.findOne({
      where: { userID: userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Update fields
    Object.keys(updateDto).forEach(key => {
      if (updateDto[key] !== undefined) {
        student[key] = updateDto[key];
      }
    });

    await this.studentRepository.save(student);
    return this.findByUserId(userId);
  }

  async updateJobPreferences(userId: string, preferences: UpdateJobPreferencesDto): Promise<StudentResponseDto> {
    const student = await this.studentRepository.findOne({
      where: { userID: userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    student.jobPreferences = {
      ...student.jobPreferences,
      ...preferences,
    };

    await this.studentRepository.save(student);
    return this.findByUserId(userId);
  }

  async uploadResume(userId: string, fileUrl: string): Promise<StudentResponseDto> {
    const student = await this.studentRepository.findOne({
      where: { userID: userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    student.resumeURL = fileUrl;
    await this.studentRepository.save(student);

    return this.findByUserId(userId);
  }

  async addCertification(userId: string, certificationDto: AddCertificationDto): Promise<StudentResponseDto> {
    const student = await this.studentRepository.findOne({
      where: { userID: userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const certifications = student.certifications || [];
    certifications.push({
      ...certificationDto,
      date: new Date(certificationDto.date),
    });

    student.certifications = certifications;
    await this.studentRepository.save(student);

    return this.findByUserId(userId);
  }

  async addWorkExperience(userId: string, workDto: AddWorkExperienceDto): Promise<StudentResponseDto> {
    const student = await this.studentRepository.findOne({
      where: { userID: userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const workExperience = student.workExperience || [];
    workExperience.push({
      ...workDto,
      startDate: new Date(workDto.startDate),
      endDate: workDto.endDate ? new Date(workDto.endDate) : null,
    });

    student.workExperience = workExperience;
    await this.studentRepository.save(student);

    return this.findByUserId(userId);
  }

  async addProject(userId: string, projectDto: AddProjectDto): Promise<StudentResponseDto> {
    const student = await this.studentRepository.findOne({
      where: { userID: userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const projects = student.projects || [];
    projects.push(projectDto);

    student.projects = projects;
    await this.studentRepository.save(student);

    return this.findByUserId(userId);
  }

  async syncGitHubPortfolio(userId: string, githubUsername: string): Promise<{ message: string; skillsFound: string[] }> {
    const student = await this.studentRepository.findOne({
      where: { userID: userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    try {
      // Sync GitHub portfolio
      const portfolioData = await this.githubService.syncUserPortfolio(
        githubUsername,
        student.githubId ? undefined : student.githubId // Use access token if available
      );

      // Extract skills from repositories
      const extractedSkills = await this.githubService.extractSkillsFromRepositories(
        portfolioData.repositories
      );

      // Update student skills (merge with existing)
      const existingSkills = student.skills || [];
      const allSkills = [...new Set([...existingSkills, ...extractedSkills])];
      student.skills = allSkills;

      // Update programming languages
      const languages = Object.keys(portfolioData.languages);
      student.programmingLanguages = [...new Set([...(student.programmingLanguages || []), ...languages])];

      await this.studentRepository.save(student);

      // Create or update portfolio entry
      let portfolio = await this.portfolioRepository.findOne({
        where: { 
          studentID: userId,
          platform: 'github' as any
        },
      });

      if (!portfolio) {
        portfolio = this.portfolioRepository.create({
          studentID: userId,
          platform: 'github' as any,
          profileURL: `https://github.com/${githubUsername}`,
        });
      }

      portfolio.metadata = portfolioData.profile;
      portfolio.statistics = portfolioData.stats;
      portfolio.lastSynced = new Date();
      portfolio.isVerified = true;

      await this.portfolioRepository.save(portfolio);

      return {
        message: 'GitHub portfolio synced successfully',
        skillsFound: extractedSkills,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to sync GitHub portfolio: ${error.message}`);
    }
  }

  async getApplications(userId: string, status?: string): Promise<Application[]> {
    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('job.company', 'company')
      .where('application.studentID = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('application.status = :status', { status });
    }

    return queryBuilder
      .orderBy('application.appliedAt', 'DESC')
      .getMany();
  }

  async getJobRecommendations(userId: string, limit: number = 10): Promise<Job[]> {
    const student = await this.studentRepository.findOne({
      where: { userID: userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Basic recommendation algorithm based on skills
    const studentSkills = student.skills || [];
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .where('job.status = :status', { status: 'active' });

    if (studentSkills.length > 0) {
      queryBuilder.andWhere(
        'job.skillsRequired && :skills OR job.requirements::text ILIKE ANY(:skillPatterns)',
        {
          skills: studentSkills,
          skillPatterns: studentSkills.map(skill => `%${skill}%`),
        }
      );
    }

    // Consider job preferences
    if (student.jobPreferences) {
      const { jobTypes, locations, remoteWork, industries } = student.jobPreferences;

      if (jobTypes?.length > 0) {
        queryBuilder.andWhere('job.jobType = ANY(:jobTypes)', { jobTypes });
      }

      if (remoteWork) {
        queryBuilder.andWhere('(job.isRemote = true OR job.isHybrid = true)');
      }

      if (locations?.length > 0 && !remoteWork) {
        queryBuilder.andWhere('job.location = ANY(:locations)', { locations });
      }
    }

    return queryBuilder
      .orderBy('job.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getProfileCompletionScore(userId: string): Promise<{
    score: number;
    missingFields: string[];
    suggestions: string[];
  }> {
    const student = await this.studentRepository.findOne({
      where: { userID: userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    let completedFields = 0;
    const totalFields = 15;
    const missingFields: string[] = [];
    const suggestions: string[] = [];

    // Check required fields
    const fieldChecks = [
      { field: 'name', value: student.name, weight: 1 },
      { field: 'email', value: student.email, weight: 1 },
      { field: 'bio', value: student.bio, weight: 1 },
      { field: 'major', value: student.major, weight: 1 },
      { field: 'graduationYear', value: student.graduationYear, weight: 1 },
      { field: 'academicLevel', value: student.academicLevel, weight: 1 },
      { field: 'skills', value: student.skills?.length > 0, weight: 2 },
      { field: 'programmingLanguages', value: student.programmingLanguages?.length > 0, weight: 1 },
      { field: 'resumeURL', value: student.resumeURL, weight: 2 },
      { field: 'profilePictureURL', value: student.profilePictureURL, weight: 1 },
      { field: 'jobPreferences', value: student.jobPreferences, weight: 1 },
      { field: 'workExperience', value: student.workExperience?.length > 0, weight: 1 },
      { field: 'projects', value: student.projects?.length > 0, weight: 1 },
    ];

    fieldChecks.forEach(({ field, value, weight }) => {
      if (value) {
        completedFields += weight;
      } else {
        missingFields.push(field);
      }
    });

    const score = Math.round((completedFields / totalFields) * 100);

    // Generate suggestions
    if (!student.bio) suggestions.push('Add a compelling bio to attract recruiters');
    if (!student.resumeURL) suggestions.push('Upload your resume');
    if (!student.skills?.length) suggestions.push('Add your technical skills');
    if (!student.projects?.length) suggestions.push('Showcase your projects');
    if (!student.workExperience?.length) suggestions.push('Add your work experience');
    if (!student.jobPreferences) suggestions.push('Set your job preferences to get better recommendations');

    return {
      score,
      missingFields,
      suggestions,
    };
  }

  private toResponseDto(student: Student): StudentResponseDto {
    return {
      userID: student.userID,
      email: student.email,
      name: student.name,
      studentID: student.studentID,
      universityID: student.universityID,
      GPA: student.GPA,
      graduationYear: student.graduationYear,
      skills: student.skills,
      major: student.major,
      minor: student.minor,
      academicLevel: student.academicLevel,
      bio: student.bio,
      programmingLanguages: student.programmingLanguages,
      frameworks: student.frameworks,
      resumeURL: student.resumeURL,
      profilePictureURL: student.profilePictureURL,
      jobPreferences: student.jobPreferences,
      certifications: student.certifications,
      workExperience: student.workExperience,
      projects: student.projects,
      isVerified: student.isVerified,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }
}
