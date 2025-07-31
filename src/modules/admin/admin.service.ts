import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  User,
  Student,
  Recruiter,
  Company,
  Job,
  Application,
  University,
  PlatformAdmin,
} from '../../entities';
import { UserStatus, ApplicationStatus, JobStatus, VerificationStatus } from '../../common/enums/user-status.enum';
import {
  AdminDashboardDto,
  UserManagementDto,
  SystemStatsDto,
  ModerateContentDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Recruiter)
    private recruiterRepository: Repository<Recruiter>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(University)
    private universityRepository: Repository<University>,
    @InjectRepository(PlatformAdmin)
    private platformAdminRepository: Repository<PlatformAdmin>,
  ) {}

  async getDashboardStats(adminId: string): Promise<AdminDashboardDto> {
    await this.validateAdminAccess(adminId);

    const [
      totalUsers,
      totalStudents,
      totalRecruiters,
      totalCompanies,
      totalJobs,
      totalApplications,
      activeJobs,
      pendingVerifications,
    ] = await Promise.all([
      this.userRepository.count(),
      this.studentRepository.count(),
      this.recruiterRepository.count(),
      this.companyRepository.count(),
      this.jobRepository.count(),
      this.jobRepository.count({ where: { status: JobStatus.ACTIVE } }),
      this.jobRepository.count({ where: { status: JobStatus.ACTIVE } }),
      this.companyRepository.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
    ]);

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await this.userRepository.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        } as any,
      },
    });

    // Get application statistics
    const applicationStats = await this.getApplicationStatsByStatus();

    // Get user growth data (last 12 months)
    const userGrowthData = await this.getUserGrowthData();

    return {
      totalUsers,
      totalStudents,
      totalRecruiters,
      totalCompanies,
      totalJobs,
      totalApplications,
      activeJobs,
      pendingVerifications,
      recentUsers,
      applicationStats,
      userGrowthData,
      systemHealth: {
        status: 'healthy',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
    };
  }

  async getSystemStats(adminId: string): Promise<SystemStatsDto> {
    await this.validateAdminAccess(adminId);

    const [
      usersByStatus,
      companiesByVerificationStatus,
      jobsByStatus,
      applicationsByStatus,
    ] = await Promise.all([
      this.getUsersByStatus(),
      this.getCompaniesByVerificationStatus(),
      this.getJobsByStatus(),
      this.getApplicationsByStatus(),
    ]);

    const topUniversities = await this.getTopUniversities();
    const topCompanies = await this.getTopCompanies();

    return {
      usersByStatus,
      companiesByVerificationStatus,
      jobsByStatus,
      applicationsByStatus,
      topUniversities,
      topCompanies,
    };
  }

  async manageUser(
    adminId: string,
    userId: string,
    action: string,
    reason?: string,
  ): Promise<{ message: string }> {
    await this.validateAdminAccess(adminId);

    const user = await this.userRepository.findOne({
      where: { userID: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    switch (action) {
      case 'suspend':
        user.status = UserStatus.SUSPENDED;
        break;
      case 'activate':
        user.status = UserStatus.ACTIVE;
        break;
      case 'verify':
        user.isVerified = true;
        user.status = UserStatus.ACTIVE;
        break;
      case 'unverify':
        user.isVerified = false;
        break;
      default:
        throw new NotFoundException('Invalid action');
    }

    await this.userRepository.save(user);

    // Log admin action
    await this.logAdminAction(adminId, 'user_management', {
      action,
      targetUser: userId,
      reason,
    });

    return { message: `User ${action} successfully` };
  }

  async getAllUsers(
    adminId: string,
    page: number = 1,
    limit: number = 20,
    userType?: string,
    status?: UserStatus,
  ): Promise<{ users: UserManagementDto[]; total: number }> {
    await this.validateAdminAccess(adminId);

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (userType) {
      if (userType === 'student') {
        queryBuilder.andWhere('user.discriminator = :type', { type: 'student' });
      } else if (userType === 'recruiter') {
        queryBuilder.andWhere('user.discriminator = :type', { type: 'recruiter' });
      }
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users: users.map(user => ({
        userID: user.userID,
        email: user.email,
        name: user.name,
        status: user.status,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        userType: user.constructor.name.toLowerCase(),
      })),
      total,
    };
  }

  async moderateContent(
    adminId: string,
    moderateDto: ModerateContentDto,
  ): Promise<{ message: string }> {
    await this.validateAdminAccess(adminId);

    const { entityType, entityId, action, reason } = moderateDto;

    let entity;
    let repository;

    switch (entityType) {
      case 'job':
        repository = this.jobRepository;
        break;
      case 'company':
        repository = this.companyRepository;
        break;
      default:
        throw new NotFoundException('Invalid entity type');
    }

    entity = await repository.findOne({ where: { [entityType + 'ID']: entityId } });

    if (!entity) {
      throw new NotFoundException(`${entityType} not found`);
    }

    switch (action) {
      case 'approve':
        if (entityType === 'company') {
          entity.verificationStatus = 'verified';
        } else if (entityType === 'job') {
          entity.status = 'active';
        }
        break;
      case 'reject':
        if (entityType === 'company') {
          entity.verificationStatus = 'rejected';
        } else if (entityType === 'job') {
          entity.status = 'rejected';
        }
        break;
      case 'suspend':
        entity.status = 'suspended';
        break;
    }

    await repository.save(entity);

    // Log moderation action
    await this.logAdminAction(adminId, 'content_moderation', {
      entityType,
      entityId,
      action,
      reason,
    });

    return { message: `${entityType} ${action} successfully` };
  }

  async generateReport(
    adminId: string,
    reportType: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    await this.validateAdminAccess(adminId);

    const dateFilter = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };

    switch (reportType) {
      case 'user_registrations':
        return this.generateUserRegistrationReport(dateFilter);
      case 'job_applications':
        return this.generateJobApplicationReport(dateFilter);
      case 'company_activity':
        return this.generateCompanyActivityReport(dateFilter);
      default:
        throw new NotFoundException('Invalid report type');
    }
  }

  private async validateAdminAccess(adminId: string): Promise<void> {
    const admin = await this.platformAdminRepository.findOne({
      where: { userID: adminId },
    });

    if (!admin) {
      throw new ForbiddenException('Admin access required');
    }
  }

  private async logAdminAction(
    adminId: string,
    actionType: string,
    details: any,
  ): Promise<void> {
    // In a real application, you'd save this to an audit log table
    console.log('Admin Action:', {
      adminId,
      actionType,
      details,
      timestamp: new Date(),
    });
  }

  private async getUsersByStatus(): Promise<Record<string, number>> {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('user.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.status')
      .getRawMany();

    return result.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});
  }

  private async getCompaniesByVerificationStatus(): Promise<Record<string, number>> {
    const result = await this.companyRepository
      .createQueryBuilder('company')
      .select('company.verificationStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('company.verificationStatus')
      .getRawMany();

    return result.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});
  }

  private async getJobsByStatus(): Promise<Record<string, number>> {
    const result = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('job.status')
      .getRawMany();

    return result.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});
  }

  private async getApplicationsByStatus(): Promise<Record<string, number>> {
    const result = await this.applicationRepository
      .createQueryBuilder('application')
      .select('application.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('application.status')
      .getRawMany();

    return result.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});
  }

  private async getApplicationStatsByStatus(): Promise<Record<string, number>> {
    return this.getApplicationsByStatus();
  }

  private async getUserGrowthData(): Promise<Array<{ month: string; count: number }>> {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select("DATE_FORMAT(user.createdAt, '%Y-%m')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('user.createdAt >= :date', { date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return result.map(item => ({
      month: item.month,
      count: parseInt(item.count),
    }));
  }

  private async getTopUniversities(): Promise<Array<{ name: string; studentCount: number }>> {
    const result = await this.universityRepository
      .createQueryBuilder('university')
      .leftJoin('university.students', 'student')
      .select('university.name', 'name')
      .addSelect('COUNT(student.userID)', 'studentCount')
      .groupBy('university.universityID')
      .orderBy('studentCount', 'DESC')
      .limit(10)
      .getRawMany();

    return result.map(item => ({
      name: item.name,
      studentCount: parseInt(item.studentCount),
    }));
  }

  private async getTopCompanies(): Promise<Array<{ name: string; jobCount: number }>> {
    const result = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoin('company.jobs', 'job')
      .select('company.name', 'name')
      .addSelect('COUNT(job.jobID)', 'jobCount')
      .groupBy('company.companyID')
      .orderBy('jobCount', 'DESC')
      .limit(10)
      .getRawMany();

    return result.map(item => ({
      name: item.name,
      jobCount: parseInt(item.jobCount),
    }));
  }

  private async generateUserRegistrationReport(dateFilter: any): Promise<any> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    
    if (dateFilter.gte) {
      queryBuilder.andWhere('user.createdAt >= :startDate', { startDate: dateFilter.gte });
    }
    if (dateFilter.lte) {
      queryBuilder.andWhere('user.createdAt <= :endDate', { endDate: dateFilter.lte });
    }

    const [total, byUserType] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .select('user.discriminator', 'userType')
        .addSelect('COUNT(*)', 'count')
        .groupBy('user.discriminator')
        .getRawMany(),
    ]);

    return {
      total,
      byUserType: byUserType.reduce((acc, item) => {
        acc[item.userType] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }

  private async generateJobApplicationReport(dateFilter: any): Promise<any> {
    const queryBuilder = this.applicationRepository.createQueryBuilder('application');
    
    if (dateFilter.gte) {
      queryBuilder.andWhere('application.appliedAt >= :startDate', { startDate: dateFilter.gte });
    }
    if (dateFilter.lte) {
      queryBuilder.andWhere('application.appliedAt <= :endDate', { endDate: dateFilter.lte });
    }

    const [total, byStatus] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .select('application.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('application.status')
        .getRawMany(),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }

  private async generateCompanyActivityReport(dateFilter: any): Promise<any> {
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoin('job.company', 'company');
    
    if (dateFilter.gte) {
      queryBuilder.andWhere('job.createdAt >= :startDate', { startDate: dateFilter.gte });
    }
    if (dateFilter.lte) {
      queryBuilder.andWhere('job.createdAt <= :endDate', { endDate: dateFilter.lte });
    }

    const result = await queryBuilder
      .select('company.name', 'companyName')
      .addSelect('COUNT(job.jobID)', 'jobsPosted')
      .groupBy('company.companyID')
      .orderBy('jobsPosted', 'DESC')
      .limit(20)
      .getRawMany();

    return {
      topCompanies: result.map(item => ({
        companyName: item.companyName,
        jobsPosted: parseInt(item.jobsPosted),
      })),
    };
  }
}