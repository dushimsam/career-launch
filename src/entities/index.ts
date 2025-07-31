import { Application } from './application.entity';
import { Company } from './company.entity';
import { Job } from './job.entity';
import { Notification } from './notification.entity';
import { PlatformAdmin } from './platform-admin.entity';
import { Portfolio } from './portfolio.entity';
import { Project } from './project.entity';
import { Recruiter } from './recruiter.entity';
import { Student } from './student.entity';
import { UniversityAdmin } from './university-admin.entity';
import { University } from './university.entity';
import { User } from './user.entity';

// Base entities
export { User } from './user.entity';
export { Student } from './student.entity';
export { Recruiter } from './recruiter.entity';
export { UniversityAdmin } from './university-admin.entity';
export { PlatformAdmin } from './platform-admin.entity';

// Core business entities
export { Company } from './company.entity';
export { University } from './university.entity';
export { Job } from './job.entity';
export { Application } from './application.entity';
export { Portfolio } from './portfolio.entity';
export { Project } from './project.entity';
export { Notification } from './notification.entity';

// Entity arrays for TypeORM configuration
export const entities = [
  User,
  Student,
  Recruiter,
  UniversityAdmin,
  PlatformAdmin,
  Company,
  University,
  Job,
  Application,
  Portfolio,
  Project,
  Notification,
];
