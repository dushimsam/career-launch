export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

export enum AcademicLevel {
  UNDERGRADUATE = 'undergraduate',
  GRADUATE = 'graduate',
  POSTGRADUATE = 'postgraduate',
}

export enum CompanySize {
  STARTUP = 'startup',
  SME = 'sme',
  LARGE = 'large',
  MULTINATIONAL = 'multinational',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  INTERNSHIP = 'internship',
  CONTRACT = 'contract',
  FREELANCE = 'freelance',
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
}

export enum JobStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  DRAFT = 'draft',
  PAUSED = 'paused',
}

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  INTERVIEWED = 'interviewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export enum PortfolioType {
  GITHUB = 'github',
  BEHANCE = 'behance',
  PERSONAL_WEBSITE = 'personal_website',
  LINKEDIN = 'linkedin',
  DRIBBBLE = 'dribbble',
}

export enum AccessLevel {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  BASIC = 'basic',
}

export enum NotificationType {
  APPLICATION_SUBMITTED = 'application_submitted',
  APPLICATION_STATUS_CHANGED = 'application_status_changed',
  NEW_JOB_MATCH = 'new_job_match',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  MESSAGE_RECEIVED = 'message_received',
  PROFILE_VERIFIED = 'profile_verified',
}
