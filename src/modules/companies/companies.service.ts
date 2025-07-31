import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../entities/company.entity';
import { Recruiter } from '../../entities/recruiter.entity';
import { Job } from '../../entities/job.entity';
import { Application } from '../../entities/application.entity';
import { 
  CreateCompanyDto, 
  UpdateCompanyDto, 
  CompanyResponseDto,
  CompanyStatsDto 
} from './dto/company.dto';
import { VerificationStatus } from '../../common/enums/user-status.enum';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Recruiter)
    private recruiterRepository: Repository<Recruiter>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async create(createDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    const company = this.companyRepository.create({
      ...createDto,
      verificationStatus: VerificationStatus.VERIFIED,
    });

    const savedCompany = await this.companyRepository.save(company);
    return this.toResponseDto(savedCompany);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    industry?: string,
    size?: string,
    location?: string,
    verified?: boolean
  ): Promise<{
    companies: CompanyResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryBuilder = this.companyRepository.createQueryBuilder('company');

    if (industry) {
      queryBuilder.andWhere('company.industry ILIKE :industry', { industry: `%${industry}%` });
    }

    if (size) {
      queryBuilder.andWhere('company.size = :size', { size });
    }

    if (location) {
      queryBuilder.andWhere('company.location ILIKE :location', { location: `%${location}%` });
    }

    if (verified !== undefined) {
      const status = verified ? VerificationStatus.VERIFIED : VerificationStatus.PENDING;
      queryBuilder.andWhere('company.verificationStatus = :status', { status });
    }

    const total = await queryBuilder.getCount();
    
    const companies = await queryBuilder
      .orderBy('company.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      companies: companies.map(company => this.toResponseDto(company)),
      total,
      page,
      totalPages,
    };
  }

  async findById(companyID: string): Promise<CompanyResponseDto> {
    const company = await this.companyRepository.findOne({
      where: { companyID },
      relations: ['recruiters', 'jobs'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.toResponseDto(company);
  }

  async update(
    companyID: string, 
    updateDto: UpdateCompanyDto,
    recruiterID: string
  ): Promise<CompanyResponseDto> {
    // Verify recruiter belongs to this company
    const recruiter = await this.recruiterRepository.findOne({
      where: { userID: recruiterID, companyID },
    });

    if (!recruiter) {
      throw new ForbiddenException('You can only update your own company');
    }

    const company = await this.companyRepository.findOne({
      where: { companyID },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    Object.keys(updateDto).forEach(key => {
      if (updateDto[key] !== undefined) {
        company[key] = updateDto[key];
      }
    });

    const updatedCompany = await this.companyRepository.save(company);
    return this.toResponseDto(updatedCompany);
  }

  async uploadLogo(companyID: string, logoUrl: string, recruiterID: string): Promise<CompanyResponseDto> {
    // Verify recruiter belongs to this company
    const recruiter = await this.recruiterRepository.findOne({
      where: { userID: recruiterID, companyID },
    });

    if (!recruiter) {
      throw new ForbiddenException('You can only update your own company');
    }

    const company = await this.companyRepository.findOne({
      where: { companyID },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    company.logoURL = logoUrl;
    const updatedCompany = await this.companyRepository.save(company);

    return this.toResponseDto(updatedCompany);
  }

  async getCompanyStats(companyID: string, recruiterID: string): Promise<CompanyStatsDto> {
    // Verify recruiter belongs to this company
    const recruiter = await this.recruiterRepository.findOne({
      where: { userID: recruiterID, companyID },
    });

    if (!recruiter) {
      throw new ForbiddenException('You can only view your own company stats');
    }

    // Get total jobs
    const totalJobs = await this.jobRepository.count({
      where: { companyID },
    });

    // Get active jobs
    const activeJobs = await this.jobRepository.count({
      where: { companyID, status: 'active' as any },
    });

    // Get total applications
    const totalApplications = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.job', 'job')
      .where('job.companyID = :companyID', { companyID })
      .getCount();

    // Get hired candidates
    const hiredCandidates = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.job', 'job')
      .where('job.companyID = :companyID', { companyID })
      .andWhere('application.status = :status', { status: 'accepted' })
      .getCount();

    // Calculate average time to hire (simplified - could be more sophisticated)
    const averageTimeToHire = await this.calculateAverageTimeToHire(companyID);

    // Get top skills required
    const topSkills = await this.getTopSkillsRequired(companyID);

    // Get applications by month
    const applicationsByMonth = await this.getApplicationsByMonth(companyID);

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      hiredCandidates,
      averageTimeToHire,
      topSkillsRequired: topSkills,
      applicationsByMonth,
    };
  }

  async searchCompanies(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    companies: CompanyResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryBuilder = this.companyRepository
      .createQueryBuilder('company')
      .where('company.verificationStatus = :status', { status: VerificationStatus.VERIFIED });

    if (query) {
      queryBuilder.andWhere(
        '(company.name ILIKE :query OR company.description ILIKE :query OR company.industry ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    const total = await queryBuilder.getCount();
    
    const companies = await queryBuilder
      .orderBy('company.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      companies: companies.map(company => this.toResponseDto(company)),
      total,
      page,
      totalPages,
    };
  }

  async verifyCompany(companyID: string, status: VerificationStatus): Promise<{ message: string }> {
    const company = await this.companyRepository.findOne({
      where: { companyID },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    company.verificationStatus = status;
    await this.companyRepository.save(company);

    return { message: `Company verification status updated to ${status}` };
  }

  async getCompanyJobs(
    companyID: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .where('job.companyID = :companyID', { companyID });

    if (status) {
      queryBuilder.andWhere('job.status = :status', { status });
    }

    const total = await queryBuilder.getCount();
    
    const jobs = await queryBuilder
      .orderBy('job.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      jobs,
      total,
      page,
      totalPages,
    };
  }

  private async calculateAverageTimeToHire(companyID: string): Promise<number> {
    const result = await this.applicationRepository
      .createQueryBuilder('application')
      .select('AVG(EXTRACT(EPOCH FROM (application.updatedAt - application.appliedAt)) / 86400)', 'avgDays')
      .leftJoin('application.job', 'job')
      .where('job.companyID = :companyID', { companyID })
      .andWhere('application.status = :status', { status: 'accepted' })
      .getRawOne();

    return result?.avgDays ? Math.round(result.avgDays) : 0;
  }

  private async getTopSkillsRequired(companyID: string): Promise<Array<{ skill: string; count: number }>> {
    const jobs = await this.jobRepository.find({
      where: { companyID },
      select: ['skillsRequired'],
    });

    const skillCounts: Record<string, number> = {};
    
    jobs.forEach(job => {
      job.skillsRequired?.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    return Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private async getApplicationsByMonth(companyID: string): Promise<Array<{ month: string; count: number }>> {
    const result = await this.applicationRepository
      .createQueryBuilder('application')
      .select("DATE_TRUNC('month', application.appliedAt)", 'month')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('application.job', 'job')
      .where('job.companyID = :companyID', { companyID })
      .groupBy("DATE_TRUNC('month', application.appliedAt)")
      .orderBy('month', 'DESC')
      .limit(12)
      .getRawMany();

    return result.map(row => ({
      month: new Date(row.month).toISOString().substring(0, 7), // YYYY-MM format
      count: parseInt(row.count),
    }));
  }

  private toResponseDto(company: Company): CompanyResponseDto {
    return {
      companyID: company.companyID,
      name: company.name,
      description: company.description,
      size: company.size,
      industry: company.industry,
      location: company.location,
      website: company.website,
      logoURL: company.logoURL,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      verificationStatus: company.verificationStatus,
      foundedYear: company.foundedYear,
      employeeCount: company.employeeCount,
      benefits: company.benefits,
      technologies: company.technologies,
      mission: company.mission,
      vision: company.vision,
      values: company.values,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}
