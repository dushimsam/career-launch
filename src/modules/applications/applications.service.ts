import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, Student, Job, Company } from '../../entities';
import { ApplicationStatus } from '../../common/enums/user-status.enum';
import {
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  ApplicationResponseDto,
  ApplicationSearchDto,
} from './dto/application.dto';
import { EmailService } from '../../external/email.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private emailService: EmailService,
  ) {}

async create(
  studentId: string,
  createApplicationDto: CreateApplicationDto,
): Promise<ApplicationResponseDto> {
  const { jobID, coverLetter, expectedSalary, availabilityDate } = createApplicationDto;

  // Validate student exists
  const student = await this.studentRepository.findOne({
    where: { userID: studentId },
  });
  if (!student) {
    throw new NotFoundException('Student not found');
  }

  // Validate job exists and is active
  const job = await this.jobRepository.findOne({
    where: { jobID },
    relations: ['company'],
  });
  if (!job) {
    throw new NotFoundException('Job not found');
  }
  if (job.status !== 'active') {
    throw new BadRequestException('Job is not accepting applications');
  }
  if (job.deadline && new Date() > job.deadline) {
    throw new BadRequestException('Application deadline has passed');
  }

  // Check if student already applied
  const existingApplication = await this.applicationRepository.findOne({
    where: { studentID: studentId, jobID },
  });
  if (existingApplication) {
    throw new BadRequestException('You have already applied for this job');
  }

  // Create application
  const application = this.applicationRepository.create({
    studentID: studentId,
    jobID,
    coverLetter,
    expectedSalary,
    availabilityDate,
    status: ApplicationStatus.SUBMITTED,
    statusHistory: [{
      status: ApplicationStatus.SUBMITTED,
      timestamp: new Date(),
      updatedBy: studentId,
    }],
  });

  const savedApplication = await this.applicationRepository.save(application);

  // Update job application count
  await this.jobRepository.increment({ jobID }, 'applicationCount', 1);

  // Send confirmation email to student
  // await this.emailService.sendApplicationStatusEmail(
  //   student.email, // Directly access email from student
  //   student.name,  // Directly access name from student
  //   job.title,
  //   job.company.name,
  //   ApplicationStatus.SUBMITTED,
  // );

  return this.transformToResponseDto(savedApplication);
}

async findAll(
  searchDto: ApplicationSearchDto,
  userType: string,
  userId: string,
): Promise<{ applications: ApplicationResponseDto[]; total: number }> {
  const {
    page = 1,
    limit = 10,
    status,
    jobID,
    studentID,
    companyID,
    sortBy = 'appliedAt',
    sortOrder = 'DESC',
  } = searchDto;

  const queryBuilder = this.applicationRepository
    .createQueryBuilder('application')
    .leftJoinAndSelect('application.student', 'student')
    .leftJoinAndSelect('application.job', 'job')
    .leftJoinAndSelect('job.company', 'company');

  // Apply filters based on user type
  if (userType === 'student') {
    queryBuilder.where('application.studentID = :userId', { userId });
  } else if (userType === 'recruiter') {
    // TODO: Implement proper recruiter/company association
    // Currently recruiters are not properly linked to companies
    // This needs to be fixed by creating a proper Recruiter entity or User-Company relationship
  }

  // Additional filters
  if (status) {
    queryBuilder.andWhere('application.status = :status', { status });
  }
  if (jobID) {
    queryBuilder.andWhere('application.jobID = :jobID', { jobID });
  }
  if (studentID && userType !== 'student') {
    queryBuilder.andWhere('application.studentID = :studentID', { studentID });
  }
  if (companyID && userType === 'platform_admin') {
    queryBuilder.andWhere('job.companyID = :companyID', { companyID });
  }

  // Sorting
  queryBuilder.orderBy(`application.${sortBy}`, sortOrder);

  // Pagination
  const skip = (page - 1) * limit;
  queryBuilder.skip(skip).take(limit);

  const [applications, total] = await queryBuilder.getManyAndCount();

  return {
    applications: applications.map(app => this.transformToResponseDto(app)),
    total,
  };
}

  async findOne(
    applicationId: string,
    userType: string,
    userId: string,
  ): Promise<ApplicationResponseDto> {
    const application = await this.applicationRepository.findOne({
      where: { applicationID: applicationId },
      relations: ['student', 'job', 'job.company', 'student.user'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Check access permissions
    if (userType === 'student' && application.studentID !== userId) {
      throw new ForbiddenException('You can only view your own applications');
    } else if (userType === 'recruiter') {
      // TODO: Implement proper recruiter/company association
      // For now, skip company validation for recruiters
    }

    return this.transformToResponseDto(application);
  }

async updateStatus(
  applicationId: string,
  updateStatusDto: UpdateApplicationStatusDto,
  recruiterId: string,
): Promise<ApplicationResponseDto> {
  const { status, recruiterNotes, interviewDate } = updateStatusDto;

  const application = await this.applicationRepository.findOne({
    where: { applicationID: applicationId },
    relations: ['student', 'job', 'job.company'], // Removed 'student.user'
  });

  if (!application) {
    throw new NotFoundException('Application not found');
  }

  // TODO: Implement proper recruiter/company association
  // For now, skip company validation for recruiters

  // Update application
  application.status = status;
  if (recruiterNotes) {
    application.recruiterNotes = recruiterNotes;
  }
  if (interviewDate) {
    application.interviewInfo = {
      ...application.interviewInfo,
      scheduledDate: new Date(interviewDate),
    };
  }

  // Add to status history
  application.statusHistory = [
    ...application.statusHistory,
    {
      status,
      timestamp: new Date(),
      updatedBy: recruiterId,
      notes: recruiterNotes,
    },
  ];

  const updatedApplication = await this.applicationRepository.save(application);

  // // Send notifications
  // await this.emailService.sendApplicationStatusEmail(
  //   application.student.email, // Directly access email from student
  //   application.student.name,  // Directly access name from student
  //   application.job.title,
  //   application.job.company.name,
  //   status,
  // );

  // Send interview notification if scheduled
  if (status === ApplicationStatus.INTERVIEWED && interviewDate) {
    await this.emailService.sendInterviewScheduledEmail(
      application.student.email,
      application.student.name,
      application.job.title,
      application.job.company.name,
      new Date(interviewDate),
      'scheduled',
    );
  }

  return this.transformToResponseDto(updatedApplication);
}
  async withdraw(applicationId: string, studentId: string): Promise<void> {
    const application = await this.applicationRepository.findOne({
      where: { applicationID: applicationId, studentID: studentId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
      throw new BadRequestException('Application is already withdrawn');
    }

    if ([ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED].includes(application.status)) {
      throw new BadRequestException('Cannot withdraw application that has been processed');
    }

    application.status = ApplicationStatus.WITHDRAWN;
    application.statusHistory = [
      ...application.statusHistory,
      {
        status: ApplicationStatus.WITHDRAWN,
        timestamp: new Date(),
        updatedBy: studentId,
      },
    ];

    await this.applicationRepository.save(application);
  }

  async getApplicationStats(
    userType: string,
    userId: string,
  ): Promise<{
    total: number;
    byStatus: Record<string, number>;
    recentApplications: number;
  }> {
    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.job', 'job');

    if (userType === 'student') {
      queryBuilder.where('application.studentID = :userId', { userId });
    } else if (userType === 'recruiter') {
      // TODO: Implement proper recruiter/company association
      // For now, skip company filtering for recruiters
    }

    const applications = await queryBuilder.getMany();

    const byStatus = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    const recentApplications = applications.filter(
      app => new Date(app.appliedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      total: applications.length,
      byStatus,
      recentApplications,
    };
  }

  private transformToResponseDto(application: Application): ApplicationResponseDto {
    return {
      applicationID: application.applicationID,
      studentID: application.studentID,
      jobID: application.jobID,
      status: application.status,
      coverLetter: application.coverLetter,
      expectedSalary: application.expectedSalary,
      availabilityDate: application.availabilityDate,
      appliedAt: application.appliedAt,
      statusHistory: application.statusHistory,
      recruiterNotes: application.recruiterNotes,
      interviewDate: application.interviewInfo?.scheduledDate,
      score: application.score,
      skillsMatchPercentage: application.skillsMatchPercentage,
      student: application.student ? {
        userID: application.student.userID,
        name: application.student.name,
        email: application.student.email,
        skills: application.student.skills,
        resumeURL: application.student.resumeURL,
        gpa: application.student.GPA,
        graduationYear: application.student.graduationYear,
      } : undefined,
      job: application.job ? {
        jobID: application.job.jobID,
        title: application.job.title,
        company: application.job.company ? {
          companyID: application.job.company.companyID,
          name: application.job.company.name,
          logoURL: application.job.company.logoURL,
        } : undefined,
        location: application.job.location,
        jobType: application.job.jobType,
        experienceLevel: application.job.experienceLevel,
      } : undefined,
    };
  }
}