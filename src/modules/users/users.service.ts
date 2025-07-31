import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UpdateUserProfileDto, UpdateUserSettingsDto, UserResponseDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { userID: userId },
      select: [
        'userID',
        'email', 
        'name',
        'phoneNumber',
        'profilePictureURL',
        'isVerified',
        'status',
        'createdAt',
        'updatedAt',
        'lastLogin'
      ]
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      type: user.constructor.name.toLowerCase(),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async updateProfile(userId: string, updateDto: UpdateUserProfileDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { userID: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update fields that are provided
    Object.keys(updateDto).forEach(key => {
      if (updateDto[key] !== undefined) {
        user[key] = updateDto[key];
      }
    });

    await this.userRepository.save(user);

    return this.findById(userId);
  }

  async uploadProfilePicture(userId: string, fileUrl: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { userID: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.profilePictureURL = fileUrl;
    await this.userRepository.save(user);

    return this.findById(userId);
  }

  async deactivateAccount(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { userID: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = 'inactive' as any;
    await this.userRepository.save(user);

    return { message: 'Account deactivated successfully' };
  }

  async reactivateAccount(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { userID: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = 'active' as any;
    await this.userRepository.save(user);

    return { message: 'Account reactivated successfully' };
  }

  async deleteAccount(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { userID: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete by updating status
    user.status = 'suspended' as any;
    user.email = `deleted_${Date.now()}_${user.email}`;
    
    await this.userRepository.save(user);

    return { message: 'Account deleted successfully' };
  }

  async searchUsers(
    query: string,
    userType?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.userID',
        'user.email',
        'user.name',
        'user.profilePictureURL',
        'user.isVerified',
        'user.status',
        'user.createdAt',
      ])
      .where('user.status = :status', { status: 'active' });

    if (query) {
      queryBuilder.andWhere(
        '(user.name ILIKE :query OR user.email ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (userType) {
      queryBuilder.andWhere('user.type = :userType', { userType });
    }

    const total = await queryBuilder.getCount();
    
    const users = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => ({
        ...user,
        type: user.constructor.name.toLowerCase(),
        phoneNumber: undefined, // Don't expose phone numbers in search
      })),
      total,
      page,
      totalPages,
    };
  }

  async getUserStats(userId: string): Promise<{
    profileCompletion: number;
    accountAge: number;
    lastActivity: Date;
    verificationStatus: boolean;
  }> {
    const user = await this.userRepository.findOne({
      where: { userID: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate profile completion percentage
    let completedFields = 0;
    const totalFields = 6; // name, email, phone, profile picture, verification, etc.

    if (user.name) completedFields++;
    if (user.email) completedFields++;
    if (user.phoneNumber) completedFields++;
    if (user.profilePictureURL) completedFields++;
    if (user.isVerified) completedFields++;
    completedFields++; // Always count password as completed

    const profileCompletion = Math.round((completedFields / totalFields) * 100);

    // Calculate account age in days
    const accountAge = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      profileCompletion,
      accountAge,
      lastActivity: user.lastLogin || user.updatedAt,
      verificationStatus: user.isVerified,
    };
  }

  async updateUserStatus(userId: string, status: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { userID: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const validStatuses = ['active', 'inactive', 'suspended', 'pending_verification'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    user.status = status as any;
    await this.userRepository.save(user);

    return { message: `User status updated to ${status}` };
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    userType?: string,
    status?: string,
  ): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.userID',
        'user.email',
        'user.name',
        'user.phoneNumber',
        'user.profilePictureURL',
        'user.isVerified',
        'user.status',
        'user.createdAt',
        'user.updatedAt',
        'user.lastLogin',
      ]);

    if (userType) {
      queryBuilder.where('user.type = :userType', { userType });
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    const total = await queryBuilder.getCount();
    
    const users = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => ({
        ...user,
        type: user.constructor.name.toLowerCase(),
      })),
      total,
      page,
      totalPages,
    };
  }
}
