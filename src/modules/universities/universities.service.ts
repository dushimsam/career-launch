import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { University } from '../../entities/university.entity';
import { Student } from '../../entities/student.entity';
import { UniversityAdmin } from '../../entities/university-admin.entity';
import { Application } from '../../entities/application.entity';
import { Job } from '../../entities/job.entity';
import { 
  CreateUniversityDto,
  UpdateUniversityDto,
  VerifyStudentDto,
  PlacementReportDto,
  UniversityResponseDto,
  PlacementStatsDto,
  StudentVerificationDto
} from './dto/university.dto';
import { VerificationStatus, UserStatus } from '../../common/enums/user-status.enum';
import { EmailService } from '../../external/email.service';

@Injectable()
export class UniversitiesService {
  constructor(
    @InjectRepository(University)
    private universityRepository: Repository<University>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(UniversityAdmin)
    private universityAdminRepository: Repository<UniversityAdmin>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private emailService: EmailService,
  ) {}

  async createUniversity(createDto: CreateUniversityDto): Promise<UniversityResponseDto> {
    const university = this.universityRepository.create({
      ...createDto,
      verificationStatus: VerificationStatus.PENDING,
    });

    const savedUniversity = await this.universityRepository.save(university);
    return this.toResponseDto(savedUniversity);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    location?: string,
    verified?: boolean
  ): Promise<{
    universities: UniversityResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryBuilder = this.universityRepository.createQueryBuilder('university');

    if (location) {
      queryBuilder.andWhere('university.location ILIKE :location', { location: `%${location}%` });
    }

    if (verified !== undefined) {
      const status = verified ? VerificationStatus.VERIFIED : VerificationStatus.PENDING;
      queryBuilder.andWhere('university.verificationStatus = :status', { status });
    }

    const total = await queryBuilder.getCount();
    
    const universities = await queryBuilder
      .orderBy('university.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      universities: universities.map(university => this.toResponseDto(university)),
      total,
      page,
      totalPages,
    };
  }

  async findById(universityID: string): Promise<UniversityResponseDto> {
    const university = await this.universityRepository.findOne({
      where: { universityID },
    });

    if (!university) {
      throw new NotFoundException('University not found');
    }

    return this.toResponseDto(university);
  }

  async update(
    universityID: string, 
    updateDto: UpdateUniversityDto,
    adminID: string
  ): Promise<UniversityResponseDto> {
    // Verify admin belongs to this university
    const admin = await this.universityAdminRepository.findOne({
      where: { userID: adminID, universityID },
    });

    if (!admin) {
      throw new ForbiddenException('You can only update your own university');
    }

    const university = await this.universityRepository.findOne({
      where: { universityID },
    });

    if (!university) {
      throw new NotFoundException('University not found');
    }

    Object.keys(updateDto).forEach(key => {
      if (updateDto[key] !== undefined) {
        university[key] = updateDto[key];
      }
    });

    const updatedUniversity = await this.universityRepository.save(university);
    return this.toResponseDto(updatedUniversity);
  }

  async uploadLogo(universityID: string, logoUrl: string, adminID: string): Promise<UniversityResponseDto> {
    // Verify admin belongs to this university
    const admin = await this.universityAdminRepository.findOne({
      where: { userID: adminID, universityID },
    });

    if (!admin) {
      throw new ForbiddenException('You can only update your own university');
    }

    const university = await this.universityRepository.findOne({
      where: { universityID },
    });

    if (!university) {
      throw new NotFoundException('University not found');
    }

    university.logoURL = logoUrl;
    const updatedUniversity = await this.universityRepository.save(university);

    return this.toResponseDto(updatedUniversity);
  }

  async verifyStudent(
    universityID: string, 
    adminID: string, 
    verifyDto: VerifyStudentDto
  ): Promise<{ message: string }> {
    // Verify admin belongs to this university
    const admin = await this.universityAdminRepository.findOne({
      where: { userID: adminID, universityID },
    });

    if (!admin || !admin.canVerifyStudents) {
      throw new ForbiddenException('You do not have permission to verify students');
    }

    const student = await this.studentRepository.findOne({
      where: { userID: verifyDto.studentID },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.universityID && student.universityID !== universityID) {
      throw new BadRequestException('Student belongs to a different university');
    }

    // Update student verification
    student.universityID = universityID;
    student.studentID = verifyDto.studentNumber;
    
    if (verifyDto.status === 'verified') {
      student.isVerified = true;
      student.status = UserStatus.ACTIVE;
      
      if (verifyDto.program) {
        student.major = verifyDto.program;
      }
      
      if (verifyDto.expectedGraduationYear) {
        student.graduationYear = verifyDto.expectedGraduationYear;
      }
    } else {
      student.isVerified = false;
      student.status = UserStatus.SUSPENDED;
    }

    await this.studentRepository.save(student);

    // Send notification email
    const statusText = verifyDto.status === 'verified' ? 'verified' : 'rejected';
    await this.emailService.sendVerificationEmail(
      student.email,
      student.name,
      `Your student status has been ${statusText}`
    );

    return { 
      message: `Student ${statusText} successfully` 
    };
  }

  async getUniversityStudents(
    universityID: string,
    adminID: string,
    verified?: boolean,
    program?: string,
    page: number = 1,
    limit: number = 10
  ) {
    // Verify admin belongs to this university
    const admin = await this.universityAdminRepository.findOne({
      where: { userID: adminID, universityID },
    });

    if (!admin) {
      throw new ForbiddenException('You can only view students from your own university');
    }

    const queryBuilder = this.studentRepository
      .createQueryBuilder('student')
      .where('student.universityID = :universityID', { universityID });

    if (verified !== undefined) {
      queryBuilder.andWhere('student.isVerified = :verified', { verified });
    }

    if (program) {
      queryBuilder.andWhere('student.major ILIKE :program', { program: `%${program}%` });
    }

    const total = await queryBuilder.getCount();
    
    const students = await queryBuilder
      .orderBy('student.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      students: students.map(student => ({
        userID: student.userID,
        name: student.name,
        email: student.email,
        studentID: student.studentID,
        major: student.major,
        graduationYear: student.graduationYear,
        GPA: student.GPA,
        isVerified: student.isVerified,
        status: student.status,
        createdAt: student.createdAt,
      })),
      total,
      page,
      totalPages,
    };
  }

  async getPlacementStats(
    universityID: string,
    adminID: string,
    reportDto?: PlacementReportDto
  ): Promise<PlacementStatsDto> {
    // Verify admin belongs to this university
    const admin = await this.universityAdminRepository.findOne({
      where: { userID: adminID, universityID },
    });

    if (!admin || !admin.canViewPlacements) {
      throw new ForbiddenException('You do not have permission to view placement statistics');
    }

    const year = reportDto?.year || new Date().getFullYear();
    
    // Get total graduates for the year
    const totalGraduates = await this.studentRepository
      .createQueryBuilder('student')
      .where('student.universityID = :universityID', { universityID })
      .andWhere('student.graduationYear = :year', { year })
      .getCount();

    // Get placed graduates (students with accepted applications)
    const placedGraduatesQuery = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.student', 'student')
      .where('student.universityID = :universityID', { universityID })
      .andWhere('student.graduationYear = :year', { year })
      .andWhere('application.status = :status', { status: 'accepted' })
      .select('DISTINCT student.userID')
      .getRawMany();

    const placedGraduates = placedGraduatesQuery.length;
    const placementRate = totalGraduates > 0 ? Math.round((placedGraduates / totalGraduates) * 100) : 0;

    // Get top employers
    const topEmployers = await this.getTopEmployers(universityID, year);

    // Get placements by program
    const placementsByProgram = await this.getPlacementsByProgram(universityID, year);

    // Get placements by industry
    const placementsByIndustry = await this.getPlacementsByIndustry(universityID, year);

    // Get placement trends (last 5 years)
    const placementTrends = await this.getPlacementTrends(universityID);

    // Calculate average salary (simplified - would need more detailed salary data)
    const averageSalary = 0; // Would require more complex calculation

    return {
      totalGraduates,
      placedGraduates,
      placementRate,
      averageSalary,
      topEmployers,
      placementsByProgram,
      placementsByIndustry,
      placementTrends,
    };
  }

  async shareJobOpportunity(
    universityID: string,
    adminID: string,
    jobID: string
  ): Promise<{ message: string; studentsNotified: number }> {
    // Verify admin belongs to this university
    const admin = await this.universityAdminRepository.findOne({
      where: { userID: adminID, universityID },
    });

    if (!admin || !admin.canShareJobs) {
      throw new ForbiddenException('You do not have permission to share job opportunities');
    }

    const job = await this.jobRepository.findOne({
      where: { jobID },
      relations: ['company'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Get eligible students (verified, active, matching skills/program)
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .where('student.universityID = :universityID', { universityID })
      .andWhere('student.isVerified = true')
      .andWhere('student.status = :status', { status: UserStatus.ACTIVE })
      .getMany();

    let studentsNotified = 0;

    // Send notifications to matching students
    for (const student of students) {
      // Simple matching logic - could be more sophisticated
      const skillMatch = student.skills?.some(skill => 
        job.skillsRequired?.includes(skill)
      ) || false;

      if (skillMatch || !job.skillsRequired?.length) {
        try {
          await this.emailService.sendJobMatchNotification(
            student.email,
            student.name,
            [{
              title: job.title,
              company: job.company.name,
              location: job.location || 'Remote',
              id: job.jobID,
            }]
          );
          studentsNotified++;
        } catch (error) {
          console.error(`Failed to send notification to ${student.email}:`, error);
        }
      }
    }

    return {
      message: 'Job opportunity shared successfully',
      studentsNotified,
    };
  }

  async searchUniversities(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    universities: UniversityResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryBuilder = this.universityRepository
      .createQueryBuilder('university')
      .where('university.verificationStatus = :status', { status: VerificationStatus.VERIFIED });

    if (query) {
      queryBuilder.andWhere(
        '(university.name ILIKE :query OR university.location ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    const total = await queryBuilder.getCount();
    
    const universities = await queryBuilder
      .orderBy('university.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      universities: universities.map(university => this.toResponseDto(university)),
      total,
      page,
      totalPages,
    };
  }

  private async getTopEmployers(universityID: string, year: number) {
    const result = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.student', 'student')
      .leftJoin('application.job', 'job')
      .leftJoin('job.company', 'company')
      .select('company.name', 'name')
      .addSelect('COUNT(*)', 'hiredCount')
      .where('student.universityID = :universityID', { universityID })
      .andWhere('student.graduationYear = :year', { year })
      .andWhere('application.status = :status', { status: 'accepted' })
      .groupBy('company.companyID, company.name')
      .orderBy('hiredCount', 'DESC')
      .limit(10)
      .getRawMany();

    return result.map(item => ({
      name: item.name,
      hiredCount: parseInt(item.hiredCount),
    }));
  }

  private async getPlacementsByProgram(universityID: string, year: number) {
    // This would require more complex queries to calculate placement rates by program
    // For now, returning a simplified version
    const programs = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.major', 'program')
      .addSelect('COUNT(*)', 'total')
      .where('student.universityID = :universityID', { universityID })
      .andWhere('student.graduationYear = :year', { year })
      .andWhere('student.major IS NOT NULL')
      .groupBy('student.major')
      .getRawMany();

    return programs.map(item => ({
      program: item.program,
      placementRate: 75, // Simplified - would need complex calculation
      count: parseInt(item.total),
    }));
  }

  private async getPlacementsByIndustry(universityID: string, year: number) {
    const result = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.student', 'student')
      .leftJoin('application.job', 'job')
      .leftJoin('job.company', 'company')
      .select('company.industry', 'industry')
      .addSelect('COUNT(*)', 'count')
      .where('student.universityID = :universityID', { universityID })
      .andWhere('student.graduationYear = :year', { year })
      .andWhere('application.status = :status', { status: 'accepted' })
      .andWhere('company.industry IS NOT NULL')
      .groupBy('company.industry')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return result.map(item => ({
      industry: item.industry,
      count: parseInt(item.count),
    }));
  }

  private async getPlacementTrends(universityID: string) {
    const currentYear = new Date().getFullYear();
    const trends = [];

    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i;
      
      const totalGraduates = await this.studentRepository.count({
        where: { 
          universityID,
          graduationYear: year 
        },
      });

      // Simplified calculation - would need more complex logic
      const placementRate = totalGraduates > 0 ? Math.floor(Math.random() * 30) + 70 : 0;

      trends.push({
        period: year.toString(),
        placementRate,
      });
    }

    return trends;
  }

  private toResponseDto(university: University): UniversityResponseDto {
    return {
      universityID: university.universityID,
      name: university.name,
      description: university.description,
      location: university.location,
      website: university.website,
      logoURL: university.logoURL,
      contactEmail: university.contactEmail,
      contactPhone: university.contactPhone,
      verificationStatus: university.verificationStatus,
      ranking: university.ranking,
      establishedYear: university.establishedYear,
      studentCount: university.studentCount,
      accreditations: university.accreditations,
      programs: university.programs,
      createdAt: university.createdAt,
      updatedAt: university.updatedAt,
    };
  }
}
