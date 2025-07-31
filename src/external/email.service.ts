import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('FROM_EMAIL'),
      to: email,
      subject: 'Verify Your CareerLaunch Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to CareerLaunch!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for joining CareerLaunch! To complete your registration, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If you can't click the button, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
          <p>This verification link will expire in 24 hours.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't create an account with CareerLaunch, please ignore this email.
          </p>
        </div>
      `,
    };

    // await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('FROM_EMAIL'),
      to: email,
      subject: 'Reset Your CareerLaunch Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>You requested to reset your password for your CareerLaunch account. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you can't click the button, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
          <p><strong>This reset link will expire in 1 hour.</strong></p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
      `,
    };

    // await this.transporter.sendMail(mailOptions);
  }

  async sendApplicationStatusEmail(
    email: string,
    name: string,
    jobTitle: string,
    companyName: string,
    status: string,
  ): Promise<void> {
    const statusColors = {
      submitted: '#3b82f6',
      under_review: '#f59e0b',
      shortlisted: '#10b981',
      interviewed: '#8b5cf6',
      accepted: '#059669',
      rejected: '#dc2626',
    };

    const color = statusColors[status] || '#6b7280';
    const statusText = status.replace('_', ' ').toUpperCase();

    const mailOptions = {
      from: this.configService.get<string>('FROM_EMAIL'),
      to: email,
      subject: `Application Update: ${jobTitle} at ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${color};">Application Status Update</h2>
          <p>Hi ${name},</p>
          <p>Your application for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated.</p>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px;"><strong>Status: <span style="color: ${color};">${statusText}</span></strong></p>
          </div>
          <p>You can view more details about your application by logging into your CareerLaunch account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get<string>('FRONTEND_URL')}/dashboard" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Dashboard
            </a>
          </div>
          <p>Best of luck with your job search!</p>
          <p>The CareerLaunch Team</p>
        </div>
      `,
    };

    // await this.transporter.sendMail(mailOptions);
  }

  async sendJobMatchNotification(
    email: string,
    name: string,
    jobs: Array<{ title: string; company: string; location: string; id: string }>,
  ): Promise<void> {
    const jobListHtml = jobs
      .map(
        (job) => `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 10px 0;">
          <h4 style="margin: 0 0 5px 0; color: #1f2937;">${job.title}</h4>
          <p style="margin: 5px 0; color: #6b7280;">${job.company} • ${job.location}</p>
          <a href="${this.configService.get<string>('FRONTEND_URL')}/jobs/${job.id}" 
             style="color: #2563eb; text-decoration: none; font-weight: 500;">
            View Job Details →
          </a>
        </div>
      `
      )
      .join('');

    const mailOptions = {
      from: this.configService.get<string>('FROM_EMAIL'),
      to: email,
      subject: `New Job Matches Found - ${jobs.length} opportunities`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Job Matches!</h2>
          <p>Hi ${name},</p>
          <p>We found ${jobs.length} new job${jobs.length > 1 ? 's' : ''} that match your profile and preferences:</p>
          ${jobListHtml}
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get<string>('FRONTEND_URL')}/jobs" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View All Jobs
            </a>
          </div>
          <p>Don't miss out on these opportunities! Apply now to increase your chances of landing your dream job.</p>
          <p>Happy job hunting!</p>
          <p>The CareerLaunch Team</p>
        </div>
      `,
    };

    // await this.transporter.sendMail(mailOptions);
  }

  async sendInterviewScheduledEmail(
    email: string,
    name: string,
    jobTitle: string,
    companyName: string,
    interviewDate: Date,
    interviewType: string,
    location?: string,
  ): Promise<void> {
    const formattedDate = interviewDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = interviewDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const mailOptions = {
      from: this.configService.get<string>('FROM_EMAIL'),
      to: email,
      subject: `Interview Scheduled: ${jobTitle} at ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Interview Scheduled!</h2>
          <p>Hi ${name},</p>
          <p>Congratulations! You have been selected for an interview for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <h3 style="margin: 0 0 15px 0; color: #0c4a6e;">Interview Details</h3>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${formattedTime}</p>
            <p style="margin: 5px 0;"><strong>Type:</strong> ${interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} Interview</p>
            ${location ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>` : ''}
          </div>

          <p>Please make sure to:</p>
          <ul style="color: #374151;">
            <li>Confirm your attendance</li>
            <li>Prepare relevant documents (resume, portfolio, etc.)</li>
            <li>Research the company and role</li>
            <li>Prepare thoughtful questions about the position</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get<string>('FRONTEND_URL')}/dashboard" 
               style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Application Details
            </a>
          </div>

          <p>Best of luck with your interview!</p>
          <p>The CareerLaunch Team</p>
        </div>
      `,
    };

    // await this.transporter.sendMail(mailOptions);
  }
}
