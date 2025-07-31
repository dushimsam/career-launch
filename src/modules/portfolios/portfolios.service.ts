import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from '../../entities/portfolio.entity';
import { Project } from '../../entities/project.entity';
import { Student } from '../../entities/student.entity';
import { 
  CreatePortfolioDto,
  UpdatePortfolioDto,
  CreateProjectDto,
  UpdateProjectDto,
  PortfolioResponseDto,
  ProjectResponseDto,
  SyncPortfolioDto
} from './dto/portfolio.dto';
import { GitHubService } from '../../external/github.service';
import { PortfolioType } from '../../common/enums/user-status.enum';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private githubService: GitHubService,
  ) {}

  async createPortfolio(studentID: string, createDto: CreatePortfolioDto): Promise<PortfolioResponseDto> {
    // Check if portfolio for this platform already exists
    const existingPortfolio = await this.portfolioRepository.findOne({
      where: { 
        studentID,
        platform: createDto.platform
      },
    });

    if (existingPortfolio) {
      throw new BadRequestException(`Portfolio for ${createDto.platform} already exists`);
    }

    const portfolio = this.portfolioRepository.create({
      ...createDto,
      studentID,
      isVerified: false,
      isPublic: createDto.isPublic ?? true,
      autoSync: createDto.autoSync ?? true,
    });

    const savedPortfolio = await this.portfolioRepository.save(portfolio);
    return this.toPortfolioResponseDto(savedPortfolio);
  }

  async getStudentPortfolios(studentID: string): Promise<PortfolioResponseDto[]> {
    const portfolios = await this.portfolioRepository.find({
      where: { studentID },
      relations: ['projects'],
      order: { createdAt: 'DESC' },
    });

    return portfolios.map(portfolio => this.toPortfolioResponseDto(portfolio));
  }

  async getPortfolioById(portfolioID: string): Promise<PortfolioResponseDto> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { portfolioID },
      relations: ['projects', 'student'],
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    return this.toPortfolioResponseDto(portfolio);
  }

  async updatePortfolio(
    portfolioID: string, 
    studentID: string, 
    updateDto: UpdatePortfolioDto
  ): Promise<PortfolioResponseDto> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { portfolioID },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    if (portfolio.studentID !== studentID) {
      throw new ForbiddenException('You can only update your own portfolios');
    }

    Object.keys(updateDto).forEach(key => {
      if (updateDto[key] !== undefined) {
        portfolio[key] = updateDto[key];
      }
    });

    await this.portfolioRepository.save(portfolio);
    return this.getPortfolioById(portfolioID);
  }

  async deletePortfolio(portfolioID: string, studentID: string): Promise<{ message: string }> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { portfolioID },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    if (portfolio.studentID !== studentID) {
      throw new ForbiddenException('You can only delete your own portfolios');
    }

    await this.portfolioRepository.remove(portfolio);
    return { message: 'Portfolio deleted successfully' };
  }

  async syncPortfolio(
    portfolioID: string, 
    studentID: string, 
    syncDto: SyncPortfolioDto
  ): Promise<{ message: string; projectsImported: number; skillsFound: string[] }> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { portfolioID },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    if (portfolio.studentID !== studentID) {
      throw new ForbiddenException('You can only sync your own portfolios');
    }

    if (portfolio.platform !== PortfolioType.GITHUB) {
      throw new BadRequestException('Only GitHub portfolios can be synced currently');
    }

    try {
      // Sync with GitHub
      const portfolioData = await this.githubService.syncUserPortfolio(
        syncDto.username,
        syncDto.accessToken
      );

      // Update portfolio metadata
      portfolio.metadata = portfolioData.profile;
      portfolio.statistics = portfolioData.stats;
      portfolio.lastSynced = new Date();
      portfolio.isVerified = true;
      portfolio.syncStatus = {
        status: 'success',
        lastError: null,
        lastSuccessfulSync: new Date(),
      };

      await this.portfolioRepository.save(portfolio);

      // Import/update projects
      let projectsImported = 0;
      for (const repo of portfolioData.repositories) {
        // Skip forks unless specifically requested
        if (repo.fork && !repo.private) {
          continue;
        }

        let project = await this.projectRepository.findOne({
          where: { 
            portfolioID,
            repositoryURL: repo.clone_url || repo.html_url
          },
        });

        if (!project) {
          project = this.projectRepository.create({
            portfolioID,
            title: repo.name,
            description: repo.description,
            repositoryURL: repo.clone_url || repo.html_url,
            projectURL: repo.html_url,
            primaryLanguage: repo.language,
            starsCount: repo.stargazers_count,
            forksCount: repo.forks_count,
            watchersCount: repo.watchers_count,
            size: repo.size,
            topics: repo.topics || [],
            license: repo.license?.name,
            isFork: repo.fork,
            isPrivate: repo.private,
            externalCreatedAt: new Date(repo.created_at),
            externalUpdatedAt: new Date(repo.updated_at),
            metadata: repo,
          });
          projectsImported++;
        } else {
          // Update existing project
          project.description = repo.description;
          project.projectURL = repo.html_url;
          project.primaryLanguage = repo.language;
          project.starsCount = repo.stargazers_count;
          project.forksCount = repo.forks_count;
          project.watchersCount = repo.watchers_count;
          project.size = repo.size;
          project.topics = repo.topics || [];
          project.license = repo.license?.name;
          project.externalUpdatedAt = new Date(repo.updated_at);
          project.metadata = repo;
        }

        await this.projectRepository.save(project);
      }

      // Extract and update student skills
      const extractedSkills = await this.githubService.extractSkillsFromRepositories(
        portfolioData.repositories
      );

      const student = await this.studentRepository.findOne({
        where: { userID: studentID },
      });

      if (student) {
        const existingSkills = student.skills || [];
        const programmingLanguages = student.programmingLanguages || [];
        
        const allSkills = [...new Set([...existingSkills, ...extractedSkills])];
        const languages = Object.keys(portfolioData.languages);
        const allLanguages = [...new Set([...programmingLanguages, ...languages])];

        student.skills = allSkills;
        student.programmingLanguages = allLanguages;
        
        await this.studentRepository.save(student);
      }

      return {
        message: 'Portfolio synced successfully',
        projectsImported,
        skillsFound: extractedSkills,
      };

    } catch (error) {
      // Update sync status with error
      portfolio.syncStatus = {
        status: 'error',
        lastError: error.message,
        lastSuccessfulSync: portfolio.syncStatus?.lastSuccessfulSync || null,
      };
      await this.portfolioRepository.save(portfolio);

      throw new BadRequestException(`Sync failed: ${error.message}`);
    }
  }

  async createProject(portfolioID: string, studentID: string, createDto: CreateProjectDto): Promise<ProjectResponseDto> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { portfolioID },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    if (portfolio.studentID !== studentID) {
      throw new ForbiddenException('You can only add projects to your own portfolios');
    }

    const project = this.projectRepository.create({
      ...createDto,
      portfolioID,
      status: createDto.status || 'active',
    });

    const savedProject = await this.projectRepository.save(project);
    return this.toProjectResponseDto(savedProject);
  }

  async getPortfolioProjects(portfolioID: string): Promise<ProjectResponseDto[]> {
    const projects = await this.projectRepository.find({
      where: { portfolioID },
      order: { 
        starsCount: 'DESC',
        createdAt: 'DESC' 
      },
    });

    return projects.map(project => this.toProjectResponseDto(project));
  }

  async updateProject(
    projectID: string, 
    studentID: string, 
    updateDto: UpdateProjectDto
  ): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findOne({
      where: { projectID },
      relations: ['portfolio'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.portfolio.studentID !== studentID) {
      throw new ForbiddenException('You can only update your own projects');
    }

    Object.keys(updateDto).forEach(key => {
      if (updateDto[key] !== undefined) {
        project[key] = updateDto[key];
      }
    });

    await this.projectRepository.save(project);
    return this.toProjectResponseDto(project);
  }

  async deleteProject(projectID: string, studentID: string): Promise<{ message: string }> {
    const project = await this.projectRepository.findOne({
      where: { projectID },
      relations: ['portfolio'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.portfolio.studentID !== studentID) {
      throw new ForbiddenException('You can only delete your own projects');
    }

    await this.projectRepository.remove(project);
    return { message: 'Project deleted successfully' };
  }

  async getFeaturedPortfolios(limit: number = 10): Promise<PortfolioResponseDto[]> {
    const portfolios = await this.portfolioRepository.find({
      where: { 
        isFeatured: true,
        isPublic: true 
      },
      relations: ['projects', 'student'],
      order: { updatedAt: 'DESC' },
      take: limit,
    });

    return portfolios.map(portfolio => this.toPortfolioResponseDto(portfolio));
  }

  async searchPortfolios(
    query?: string,
    platform?: PortfolioType,
    technologies?: string[],
    page: number = 1,
    limit: number = 10
  ): Promise<{
    portfolios: PortfolioResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryBuilder = this.portfolioRepository
      .createQueryBuilder('portfolio')
      .leftJoinAndSelect('portfolio.projects', 'projects')
      .leftJoinAndSelect('portfolio.student', 'student')
      .where('portfolio.isPublic = true');

    if (query) {
      queryBuilder.andWhere(
        '(portfolio.title ILIKE :query OR portfolio.description ILIKE :query OR student.name ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (platform) {
      queryBuilder.andWhere('portfolio.platform = :platform', { platform });
    }

    if (technologies && technologies.length > 0) {
      queryBuilder.andWhere(
        'EXISTS (SELECT 1 FROM projects p WHERE p.portfolioID = portfolio.portfolioID AND p.technologies && :technologies)',
        { technologies }
      );
    }

    const total = await queryBuilder.getCount();
    
    const portfolios = await queryBuilder
      .orderBy('portfolio.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      portfolios: portfolios.map(portfolio => this.toPortfolioResponseDto(portfolio)),
      total,
      page,
      totalPages,
    };
  }

  private toPortfolioResponseDto(portfolio: Portfolio): PortfolioResponseDto {
    return {
      portfolioID: portfolio.portfolioID,
      platform: portfolio.platform,
      profileURL: portfolio.profileURL,
      isVerified: portfolio.isVerified,
      lastSynced: portfolio.lastSynced,
      title: portfolio.title,
      description: portfolio.description,
      metadata: portfolio.metadata,
      statistics: portfolio.statistics,
      syncStatus: portfolio.syncStatus,
      autoSync: portfolio.autoSync,
      isPublic: portfolio.isPublic,
      isFeatured: portfolio.isFeatured,
      projects: portfolio.projects?.map(project => this.toProjectResponseDto(project)),
      student: portfolio.student ? {
        userID: portfolio.student.userID,
        name: portfolio.student.name,
        profilePictureURL: portfolio.student.profilePictureURL,
        major: portfolio.student.major,
        graduationYear: portfolio.student.graduationYear,
      } : undefined,
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt,
    };
  }

  private toProjectResponseDto(project: Project): ProjectResponseDto {
    return {
      projectID: project.projectID,
      title: project.title,
      description: project.description,
      technologies: project.technologies,
      projectURL: project.projectURL,
      repositoryURL: project.repositoryURL,
      imageURLs: project.imageURLs,
      videoURL: project.videoURL,
      status: project.status,
      starsCount: project.starsCount,
      forksCount: project.forksCount,
      watchersCount: project.watchersCount,
      size: project.size,
      primaryLanguage: project.primaryLanguage,
      languageStats: project.languageStats,
      topics: project.topics,
      license: project.license,
      isFork: project.isFork,
      isPrivate: project.isPrivate,
      contributionStats: project.contributionStats,
      metadata: project.metadata,
      externalCreatedAt: project.externalCreatedAt,
      externalUpdatedAt: project.externalUpdatedAt,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
