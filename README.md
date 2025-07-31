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
   git clone https://github.com/dushimsam/career-launch.git
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
#Running environment
NODE_ENV='development'
APP_PORT=7700

# Database Configuration
DB_HOST='localhost'
DB_PORT=5432
DB_USER=postgres
DB_PASS=yourpassword
DB_NAME=yourdbname

# JWT Configuration
JWT_SECRET='secret'
JWT_EXPIRES_IN='24h'
JWT_REFRESH_SECRET='secret'
JWT_REFRESH_EXPIRES_IN='7d'
```

## 🧪 Testing

```bash
# Unit tests
yarn test

# Watch mode
yarn test:watch
```

## 📊 Monitoring & Observability

- **Structured Logging** - Winston with JSON format
- **Health Checks** - `/health` endpoint
- **Metrics Ready** - Prometheus integration points
- **Error Tracking** - Comprehensive error handling

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
