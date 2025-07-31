import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  clone_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  size: number;
  topics: string[];
  license: {
    key: string;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  fork: boolean;
  private: boolean;
}

interface GitHubLanguageStats {
  [language: string]: number;
}

@Injectable()
export class GitHubService {
  private readonly baseURL = 'https://api.github.com';

  constructor(private configService: ConfigService) {}

  private getHeaders(accessToken?: string) {
    const headers: any = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'CareerLaunch-App',
    };

    if (accessToken) {
      headers['Authorization'] = `token ${accessToken}`;
    }

    return headers;
  }

  async getUserProfile(username: string, accessToken?: string): Promise<GitHubUser> {
    try {
      const response = await axios.get(
        `${this.baseURL}/users/${username}`,
        { headers: this.getHeaders(accessToken) }
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch GitHub user profile',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserRepositories(
    username: string,
    accessToken?: string,
    page: number = 1,
    perPage: number = 100,
  ): Promise<GitHubRepo[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/users/${username}/repos`,
        {
          headers: this.getHeaders(accessToken),
          params: {
            type: 'all',
            sort: 'updated',
            direction: 'desc',
            page,
            per_page: perPage,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch GitHub repositories',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getRepositoryLanguages(
    owner: string,
    repo: string,
    accessToken?: string,
  ): Promise<GitHubLanguageStats> {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/languages`,
        { headers: this.getHeaders(accessToken) }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch languages for ${owner}/${repo}:`, error.message);
      return {};
    }
  }

  async getRepositoryContributors(
    owner: string,
    repo: string,
    accessToken?: string,
  ): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/contributors`,
        { headers: this.getHeaders(accessToken) }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch contributors for ${owner}/${repo}:`, error.message);
      return [];
    }
  }

  async syncUserPortfolio(
    username: string,
    accessToken?: string,
  ): Promise<{
    profile: GitHubUser;
    repositories: GitHubRepo[];
    languages: Record<string, number>;
    stats: {
      totalRepos: number;
      totalStars: number;
      totalForks: number;
      languageDistribution: Record<string, number>;
    };
  }> {
    try {
      // Fetch user profile
      const profile = await this.getUserProfile(username, accessToken);

      // Fetch repositories (all pages)
      let allRepos: GitHubRepo[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= 10) { // Limit to 10 pages (1000 repos max)
        const repos = await this.getUserRepositories(username, accessToken, page, 100);
        if (repos.length === 0) {
          hasMore = false;
        } else {
          allRepos = [...allRepos, ...repos];
          page++;
        }
      }

      // Filter out forks if needed (optional)
      const ownRepos = allRepos.filter(repo => !repo.fork);

      // Calculate language statistics
      const languageStats: Record<string, number> = {};
      let totalStars = 0;
      let totalForks = 0;

      // Process repositories for stats
      for (const repo of ownRepos) {
        totalStars += repo.stargazers_count;
        totalForks += repo.forks_count;

        if (repo.language) {
          languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
        }

        // Get detailed language stats for the repository
        try {
          const repoLanguages = await this.getRepositoryLanguages(
            username,
            repo.name,
            accessToken,
          );
          
          // Aggregate language bytes
          Object.entries(repoLanguages).forEach(([lang, bytes]) => {
            languageStats[lang] = (languageStats[lang] || 0) + bytes;
          });
        } catch (error) {
          // Continue if language stats fail for a repo
          console.error(`Failed to get languages for ${repo.name}`);
        }
      }

      return {
        profile,
        repositories: allRepos,
        languages: languageStats,
        stats: {
          totalRepos: ownRepos.length,
          totalStars,
          totalForks,
          languageDistribution: languageStats,
        },
      };
    } catch (error) {
      throw new HttpException(
        `Failed to sync GitHub portfolio: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async extractSkillsFromRepositories(repositories: GitHubRepo[]): Promise<string[]> {
    const skills = new Set<string>();
    const skillKeywords = [
      // Programming Languages
      'javascript', 'typescript', 'python', 'java', 'cpp', 'c++', 'c#', 'csharp',
      'php', 'ruby', 'go', 'rust', 'kotlin', 'swift', 'dart', 'scala',
      
      // Web Technologies
      'react', 'vue', 'angular', 'nodejs', 'node.js', 'express', 'nestjs',
      'django', 'flask', 'laravel', 'spring', 'asp.net', 'rails',
      
      // Databases
      'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite',
      
      // Cloud & DevOps
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'ansible',
      
      // Mobile
      'android', 'ios', 'flutter', 'react-native', 'xamarin',
      
      // Other Technologies
      'graphql', 'rest', 'api', 'microservices', 'blockchain', 'machine-learning',
      'artificial-intelligence', 'data-science', 'analytics',
    ];

    repositories.forEach(repo => {
      // Extract from language
      if (repo.language) {
        skills.add(repo.language.toLowerCase());
      }

      // Extract from topics
      repo.topics?.forEach(topic => {
        const normalizedTopic = topic.toLowerCase().replace(/-/g, '');
        if (skillKeywords.some(keyword => 
          normalizedTopic.includes(keyword) || keyword.includes(normalizedTopic)
        )) {
          skills.add(topic);
        }
      });

      // Extract from description and name
      const text = `${repo.name} ${repo.description || ''}`.toLowerCase();
      skillKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          skills.add(keyword);
        }
      });
    });

    return Array.from(skills);
  }

  async getRateLimitStatus(accessToken?: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/rate_limit`,
        { headers: this.getHeaders(accessToken) }
      );
      return response.data;
    } catch (error) {
      return { error: 'Failed to get rate limit status' };
    }
  }
}
