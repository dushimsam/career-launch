import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { 
  User,
  Student,
  Recruiter,
  UniversityAdmin,
  PlatformAdmin,
  Company,
  University
} from '../entities';
import {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ChangePasswordDto,
  AuthResponseDto,
} from './dto/auth.dto';
import { UserStatus } from '../common/enums/user-status.enum';
import { EmailService } from '../external/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Recruiter)
    private recruiterRepository: Repository<Recruiter>,
    @InjectRepository(UniversityAdmin)
    private universityAdminRepository: Repository<UniversityAdmin>,
    @InjectRepository(PlatformAdmin)
    private platformAdminRepository: Repository<PlatformAdmin>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(University)
    private universityRepository: Repository<University>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, userType, name, phoneNumber, ...typeSpecificData } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = uuidv4();

    let user: User;

    // Create user based on type
    switch (userType) {
      case 'student':
        await this.validateUniversityExists(typeSpecificData.universityID);
        user = this.studentRepository.create({
          email,
          password: hashedPassword,
          name,
          phoneNumber,
          verificationToken,
          status: UserStatus.ACTIVE,
          studentID: typeSpecificData.studentID || this.generateStudentID(),
          universityID: typeSpecificData.universityID,
        });
        break;

      case 'recruiter':
        await this.validateCompanyExists(typeSpecificData.companyID);
        user = this.recruiterRepository.create({
          email,
          password: hashedPassword,
          name,
          phoneNumber,
          verificationToken,
          status: UserStatus.ACTIVE,
          recruiterID: typeSpecificData.recruiterID || this.generateRecruiterID(),
          companyID: typeSpecificData.companyID,
        });
        break;

      case 'university_admin':
        await this.validateUniversityExists(typeSpecificData.universityID);
        user = this.universityAdminRepository.create({
          email,
          password: hashedPassword,
          name,
          phoneNumber,
          verificationToken,
          status: UserStatus.ACTIVE,
          universityAdminID: this.generateUniversityAdminID(),
          universityID: typeSpecificData.universityID,
        });
        break;

      case 'platform_admin':
        user = this.platformAdminRepository.create({
          email,
          password: hashedPassword,
          name,
          phoneNumber,
          verificationToken,
          status: UserStatus.ACTIVE,
          platformAdminID: this.generatePlatformAdminID(),
        });
        break;

      default:
        throw new BadRequestException('Invalid user type');
    }

    // Save user
    await this.getUserRepository(userType).save(user);

    // Send verification email
    await this.emailService.sendVerificationEmail(email, name, verificationToken);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        userID: user.userID,
        email: user.email,
        name: user.name,
        type: userType,
        isVerified: user.isVerified,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account is suspended');
    }

    // Update last login
    await this.userRepository.update(user.userID, {
      lastLogin: new Date(),
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        userID: user.userID,
        email: user.email,
        name: user.name,
        type: user.constructor.name.toLowerCase(),
        isVerified: user.isVerified,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }

    return null;
  }

  async validateUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { userID: userId },
    });
  }

  async validateOAuthUser(oauthUser: any, provider: string): Promise<User> {
    const { email, githubId, name, profilePictureURL } = oauthUser;

    let user = await this.userRepository.findOne({
      where: [
        { email },
        { githubId },
      ],
    });

    if (!user) {
      // Create new student user from OAuth
      user = this.studentRepository.create({
        email,
        name,
        githubId,
        profilePictureURL,
        password: await bcrypt.hash(uuidv4(), 12), // Random password
        isVerified: true, // OAuth users are pre-verified
        status: UserStatus.ACTIVE,
        studentID: this.generateStudentID(),
      });

      await this.studentRepository.save(user);
    } else if (!user.githubId && githubId) {
      // Link GitHub account to existing user
      user.githubId = githubId;
      user.profilePictureURL = user.profilePictureURL || profilePictureURL;
      await this.userRepository.save(user);
    }

    return user;
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    const { token } = verifyEmailDto;

    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    user.isVerified = true;
    user.status = UserStatus.ACTIVE;
    user.verificationToken = null;

    await this.userRepository.save(user);

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    const resetToken = uuidv4();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;

    await this.userRepository.save(user);

    await this.emailService.sendPasswordResetEmail(email, user.name, resetToken);

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({
      where: { userID: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedNewPassword;

    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async refreshToken(userId: string): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOne({
      where: { userID: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = {
      sub: user.userID,
      email: user.email,
      type: user.constructor.name.toLowerCase(),
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async generateTokens(user: User) {
    const payload = {
      sub: user.userID,
      email: user.email,
      type: user.constructor.name.toLowerCase(),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async validateCompanyExists(companyID: string): Promise<void> {
    if (!companyID) {
      throw new BadRequestException('Company ID is required for recruiters');
    }

    const company = await this.companyRepository.findOne({
      where: { companyID },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }
  }

  private async validateUniversityExists(universityID: string): Promise<void> {
    if (!universityID) {
      return; // University is optional for some user types
    }

    const university = await this.universityRepository.findOne({
      where: { universityID },
    });

    if (!university) {
      throw new BadRequestException('University not found');
    }
  }

  private getUserRepository(userType: string): Repository<any> {
    switch (userType) {
      case 'student':
        return this.studentRepository;
      case 'recruiter':
        return this.recruiterRepository;
      case 'university_admin':
        return this.universityAdminRepository;
      case 'platform_admin':
        return this.platformAdminRepository;
      default:
        return this.userRepository;
    }
  }

  private generateStudentID(): string {
    return `STU${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }

  private generateRecruiterID(): string {
    return `REC${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }

  private generateUniversityAdminID(): string {
    return `UNI${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }

  private generatePlatformAdminID(): string {
    return `ADM${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || user.isVerified) {
      return { message: 'If an account with that email exists and is unverified, a verification email has been sent.' };
    }

    const verificationToken = uuidv4();
    user.verificationToken = verificationToken;
    await this.userRepository.save(user);

    await this.emailService.sendVerificationEmail(email, user.name, verificationToken);

    return { message: 'If an account with that email exists and is unverified, a verification email has been sent.' };
  }
}
