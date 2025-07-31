# CareerLaunch - Skill-Based Recruitment Platform Backend

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

## 🌍 Mission

Bridge the gap between fresh African graduates seeking employment and companies struggling to find skilled talent across Africa through an end-to-end digital platform with skill-based matching, verified credentials, and streamlined recruitment workflows.

## ✨ Features

- 🔐 **Multi-Role Authentication** - Students, Recruiters, University Admins, Platform Admins
- 🎓 **GitHub Integration** - Automatic portfolio sync and skill extraction
- 📧 **Email & SMS Notifications** - Twilio and SMTP integration
- 🔍 **Intelligent Job Matching** - Skill-based recommendation system
- 🏢 **Company Management** - Comprehensive company profiles and verification
- 📊 **Analytics Dashboard** - Placement statistics and insights
- 🔒 **Enterprise Security** - JWT, OAuth2, rate limiting, validation

## 🏗️ Architecture

Built with a modular, scalable architecture following NestJS best practices:

```
📦 CareerLaunch Backend
├── 🔐 Authentication Module (OAuth2, JWT, MFA)
├── 👥 User Management (Role-based access control)
├── 🎓 Student Module (Profiles, portfolios, applications)
├── 🏢 Company Module (Job posting, applicant management)
├── 📚 University Module (Student verification, placement tracking)
├── ⚙️ Admin Module (Platform management, analytics)
└── 🔌 External Integrations (GitHub, Email, SMS)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Yarn package manager
- Redis (optional)

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd career-launch
   yarn install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   yarn migration:run
   ```

4. **Start Development**
   ```bash
   yarn start:dev
   ```

5. **Access API Documentation**
   ```
   http://localhost:7700/api/docs
   ```

## 🔧 Configuration

### Required Environment Variables

```env
# Database
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USER=your-username
DB_PASS=your-password
DB_NAME=your-database

# JWT Security
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1h

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-app-id
GITHUB_CLIENT_SECRET=your-github-secret

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

## 📡 API Overview

### Authentication Endpoints
```http
POST /api/v1/auth/register     # User registration
POST /api/v1/auth/login        # Email/password login
GET  /api/v1/auth/github       # GitHub OAuth login
POST /api/v1/auth/verify-email # Email verification
POST /api/v1/auth/forgot-password # Password reset
```

### Core Modules
```http
# User Management
GET  /api/v1/users/profile
PUT  /api/v1/users/profile
POST /api/v1/users/upload-resume

# Student Operations
GET  /api/v1/students/applications
POST /api/v1/students/portfolio-sync
GET  /api/v1/students/recommendations

# Company & Jobs
POST /api/v1/companies/jobs
GET  /api/v1/jobs
POST /api/v1/jobs/:id/apply

# University Admin
POST /api/v1/universities/verify-student
GET  /api/v1/universities/placements
```

## 🗄️ Database Schema

### User Hierarchy (Table Inheritance)
```sql
Users (Abstract Base)
├── Students (university, GPA, skills, portfolios)
├── Recruiters (company, permissions, specializations)
├── UniversityAdmins (university, access level)
└── PlatformAdmins (system permissions)
```

### Core Entities
- **Companies** - Profiles, verification, culture
- **Jobs** - Postings, requirements, applications
- **Applications** - Status tracking, interview scheduling
- **Universities** - Student verification, placement stats
- **Portfolios** - GitHub sync, project showcase
- **Notifications** - Real-time updates

## 🧪 Testing

```bash
# Unit tests
yarn test

# Integration tests
yarn test:e2e

# Coverage report
yarn test:cov

# Watch mode
yarn test:watch
```

## 🔐 Security Features

- **Password Security** - Bcrypt hashing (12 rounds)
- **JWT Authentication** - Short-lived access tokens + refresh tokens
- **OAuth2 Integration** - GitHub authentication
- **Rate Limiting** - Throttled API endpoints
- **Input Validation** - Class-validator DTOs
- **Security Headers** - Helmet middleware
- **CORS Protection** - Configurable origins

## 🚀 Deployment

### Docker
```bash
docker build -t careerlaunch-backend .
docker run -p 7700:7700 careerlaunch-backend
```

### Production Environment
```env
NODE_ENV=production
JWT_SECRET=strong-production-secret-256-bits
DB_SSL=true
CORS_ORIGIN=https://your-frontend-domain.com
```

## 📊 Monitoring & Observability

- **Structured Logging** - Winston with JSON format
- **Health Checks** - `/health` endpoint
- **Metrics Ready** - Prometheus integration points
- **Error Tracking** - Comprehensive error handling

## 🛣️ Roadmap

### Phase 1 (Current) ✅
- User authentication & management
- Database architecture
- Core API endpoints
- GitHub integration
- Email/SMS notifications

### Phase 2 (Next)
- [ ] Job matching algorithm
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced search & filtering
- [ ] Analytics dashboard
- [ ] Mobile app APIs

### Phase 3 (Future)
- [ ] AI-powered skill assessment
- [ ] Video interview integration
- [ ] Advanced reporting
- [ ] Multi-language support
- [ ] Mobile SDKs

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow NestJS conventions
- Write comprehensive tests
- Use TypeScript strict mode
- Document APIs with Swagger
- Follow SOLID principles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Documentation**: Check `/api/docs` endpoint
- **Issues**: GitHub Issues
- **Discord**: [Join our community](link-to-discord)
- **Email**: dev@careerlaunch.com

## 🌟 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Inspired by the African tech ecosystem
- Supporting graduate employability across Africa

---

<div align="center">
  <strong>Empowering African Graduates, One Job Match at a Time</strong>
</div>
