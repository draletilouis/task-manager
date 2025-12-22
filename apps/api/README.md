# Task Manager API

A modern RESTful API for collaborative task management with workspaces, projects, and real-time tracking. Built with Node.js, Express, and Prisma ORM.

**Part of the Task Manager Monorepo** - See [root README](../../README.md) for full project documentation.

---

## Quick Start

```bash
# From project root
npm install
npm run db:generate
npm run db:migrate
npm run dev:api
```

API runs on **http://localhost:5000**

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js 18+** | Runtime (ES modules) |
| **Express 5** | REST API framework |
| **Prisma ORM** | Type-safe database toolkit |
| **PostgreSQL** | Production database |
| **SQLite** | Development database (optional) |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |
| **Resend** | Email service |
| **Jest + Supertest** | Testing framework |

---

## Architecture

### Project Structure

```
apps/api/
├── src/
│   ├── modules/              # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.middleware.js
│   │   ├── workspaces/
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── comments/
│   ├── database/
│   │   └── prisma.js         # Prisma client singleton
│   ├── shared/
│   │   └── utils/
│   │       └── validation.js
│   ├── app.js                # Express app configuration
│   └── server.js             # Server entry point
├── tests/                    # Jest test suites
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Migration history
├── jest.config.js
└── package.json
```

### Design Pattern

**Controller-Service-Repository (3-tier)**

- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and validation
- **Database**: Prisma ORM (no separate repository layer)
- **Middleware**: Auth checks, request processing
- **Routes**: Express router definitions

---

## Features

### Authentication System
- User registration with email validation
- Login with JWT access + refresh tokens
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- Token refresh endpoint
- Password change functionality
- Protected route middleware

### Workspace Management
- Create workspace (user becomes OWNER)
- List user workspaces
- Update workspace name (OWNER/ADMIN)
- Delete workspace (OWNER only)
- Invite members via email (OWNER/ADMIN)
- Accept/decline workspace invitations
- Remove members (OWNER/ADMIN)
- Update member roles (OWNER only)
- Role-based access: OWNER, ADMIN, MEMBER

### Invitation System
- Email-based workspace invitations
- Pending invitation management
- Accept/decline invitation endpoints
- Delete invitation (inviter or invitee)
- Email notifications via Resend
- Token-based invitation links

### Project Management
- Create projects in workspace
- List projects in workspace
- Update project details (OWNER/ADMIN)
- Delete projects (OWNER/ADMIN)
- Member-only access control

### Task Management
- Create tasks in projects
- List tasks by project
- Update task details (title, description, status, priority, due date)
- Delete tasks (creator or OWNER/ADMIN)
- Assign tasks to workspace members
- Status tracking: TODO, IN_PROGRESS, DONE
- Priority levels: LOW, MEDIUM, HIGH
- Due date support

### Comment System
- Add comments to tasks
- List comments on a task (chronological order)
- Update own comments
- Delete comments (creator or OWNER/ADMIN)
- Full CRUD with role-based permissions

---

## Database Schema

### User
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique, required |
| password | String | Bcrypt hashed |
| createdAt | DateTime | Timestamp |

### Workspace
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Workspace name |
| ownerId | String | FK → User |
| createdAt | DateTime | Timestamp |

### WorkspaceMember
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | String | FK → User |
| workspaceId | String | FK → Workspace |
| role | Enum | OWNER / ADMIN / MEMBER |

### Project
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Project name |
| description | String? | Optional |
| workspaceId | String | FK → Workspace |
| createdBy | String | FK → User |
| createdAt | DateTime | Timestamp |
| updatedAt | DateTime | Auto-updated |

### Task
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | String | Required |
| description | String? | Optional |
| status | TaskStatus | TODO / IN_PROGRESS / DONE |
| priority | TaskPriority | LOW / MEDIUM / HIGH |
| dueDate | DateTime? | Optional |
| assignedTo | String? | FK → User (optional) |
| projectId | String | FK → Project |
| createdBy | String | FK → User |
| createdAt | DateTime | Timestamp |
| updatedAt | DateTime | Auto-updated |

### Comment
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| content | String | Required |
| taskId | String | FK → Task |
| createdBy | String | FK → User |
| createdAt | DateTime | Timestamp |
| updatedAt | DateTime | Auto-updated |

### Invitation
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | Invitee email |
| workspaceId | String | FK → Workspace |
| invitedBy | String | FK → User |
| status | InvitationStatus | PENDING / ACCEPTED / DECLINED |
| createdAt | DateTime | Timestamp |

### ActivityLog (Schema defined, not implemented)
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| action | String | CRUD action |
| entityType | String | Model name |
| entityId | String | Record ID |
| userId | String | FK → User |
| workspaceId | String | FK → Workspace |
| createdAt | DateTime | Timestamp |

---

## API Endpoints

### Authentication
```http
POST   /auth/register          # Register new user
POST   /auth/login             # Login user
POST   /auth/refresh           # Refresh access token
POST   /auth/change-password   # Change password (protected)
```

### Workspaces
```http
POST   /workspaces                              # Create workspace
GET    /workspaces                              # List user workspaces
PUT    /workspaces/:workspaceId                 # Update workspace
DELETE /workspaces/:workspaceId                 # Delete workspace
DELETE /workspaces/:workspaceId/members/:userId # Remove member
PUT    /workspaces/:workspaceId/members/:userId # Update role
```

### Invitations
```http
POST   /invitations                    # Create invitation (send email)
GET    /invitations                    # List user invitations
GET    /invitations/pending            # List pending invitations
POST   /invitations/:invitationId/accept   # Accept invitation
POST   /invitations/:invitationId/decline  # Decline invitation
DELETE /invitations/:invitationId      # Delete invitation
```

### Projects
```http
POST   /workspaces/:workspaceId/projects              # Create project
GET    /workspaces/:workspaceId/projects              # List projects
PUT    /workspaces/:workspaceId/projects/:projectId   # Update project
DELETE /workspaces/:workspaceId/projects/:projectId   # Delete project
```

### Tasks
```http
POST   /workspaces/:workspaceId/projects/:projectId/tasks          # Create task
GET    /workspaces/:workspaceId/projects/:projectId/tasks          # List tasks
PUT    /workspaces/:workspaceId/projects/:projectId/tasks/:taskId  # Update task
DELETE /workspaces/:workspaceId/projects/:projectId/tasks/:taskId  # Delete task
```

### Comments
```http
POST   /workspaces/tasks/:taskId/comments    # Create comment
GET    /workspaces/tasks/:taskId/comments    # List comments
PUT    /workspaces/comments/:commentId       # Update comment
DELETE /workspaces/comments/:commentId       # Delete comment
```

---

## Security

### Authentication
- JWT access + refresh token system
- Secure password hashing (bcrypt, 10 rounds)
- Token expiration enforcement
- Protected route middleware

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

### Authorization
- Role-based access control (RBAC)
- Workspace membership validation
- Resource ownership verification
- Permission checks on all operations

### Input Validation
- Email format validation
- Password strength validation
- Required field validation
- SQL injection prevention (Prisma ORM)

---

## Testing

**Overall**: 56/58 tests passing (96.5%)

| Module | Tests | Status |
|--------|-------|--------|
| Task Service | 14/16 | 88% |
| Task Routes | 15/15 | 100% |
| Comment Service | 12/12 | 100% |
| Comment Routes | 15/15 | 100% |

### Running Tests

```bash
# From project root
npm run test:api

# Specific test file
npm run test:api -- task.service

# With coverage
npm run test:api -- --coverage
```

### Test Structure

**Unit Tests (Service Layer)**
- Mock Prisma database calls
- Test business logic in isolation
- Validate permissions and data processing

**Integration Tests (Route Layer)**
- Test HTTP endpoints end-to-end
- Mock authentication middleware
- Validate request/response flow
- Test error handling

---

## Development

### Prerequisites
- Node.js 18+
- npm 9+

### Setup

```bash
# Install dependencies (from root)
npm install

# Set up environment
cd apps/api
cp .env.example .env

# Configure .env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-secret-key-32-chars-minimum"
JWT_REFRESH_SECRET="different-secret-key-32-chars"
PORT=5000
```

### Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Prisma Studio (GUI)
npm run db:studio
```

### Running

```bash
# Development (from root)
npm run dev:api

# Production (from root)
npm run start:api
```

---

## Pending Tasks

### HIGH PRIORITY

#### Testing
- [ ] Add tests for Auth module (0% coverage)
- [ ] Add tests for Workspace module (0% coverage)
- [ ] Add tests for Project module (0% coverage)
- [ ] Fix 2 failing delete permission tests (ES module mocking)

#### Security
- [ ] Add rate limiting (express-rate-limit)
- [ ] Add request validation (express-validator/Zod)
- [ ] Configure CORS
- [ ] Add helmet.js security headers
- [ ] Implement request logging (Winston/Pino)
- [ ] Add error tracking (Sentry)

#### Infrastructure
- [ ] Add health check endpoint (`GET /health`)
- [ ] Create database seed script
- [ ] Add graceful shutdown handling
- [ ] Implement connection pooling

### MEDIUM PRIORITY

#### Features
- [ ] **Implement Activity Log System** (schema exists)
  - Track all CRUD operations
  - Activity feed endpoints
  - User history tracking
- [ ] Add pagination to all list endpoints
- [ ] File upload support for tasks
- [ ] Email notification system
- [ ] Bulk operations for tasks

#### Code Quality
- [ ] Migrate to TypeScript
- [ ] Add JSDoc comments
- [ ] Global error handling middleware
- [ ] Consistent error response format
- [ ] API versioning (`/api/v1/...`)

#### Performance
- [ ] Add database indexes on foreign keys
- [ ] Implement caching (Redis)
- [ ] Query optimization
- [ ] Response compression (compression middleware)

### LOW PRIORITY

#### Documentation
- [ ] Create OpenAPI/Swagger spec
- [ ] Add API request/response examples
- [ ] Document error codes
- [ ] Create troubleshooting guide

#### Developer Experience
- [ ] Add database migration rollback strategy
- [ ] Create development seed data
- [ ] Add request/response logging in dev mode

---

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager"
# Or for development with SQLite:
# DATABASE_URL="file:./prisma/dev.db"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars"
JWT_REFRESH_SECRET="different-super-secret-refresh-key-32-chars"

# Server
PORT=5000
NODE_ENV=development
HOST=0.0.0.0

# Frontend
FRONTEND_URL="http://localhost:5173,http://localhost:5174,http://localhost:5175"

# Email (Resend)
RESEND_API_KEY="re_your_api_key_here"
FROM_EMAIL="noreply@yourdomain.com"
```

---

## Commands

From project root:

```bash
npm run dev:api           # Start dev server (watch mode)
npm run start:api         # Production server
npm run test:api          # Run tests
npm run db:migrate        # Run Prisma migrations
npm run db:seed           # Seed database
npm run db:studio         # Open Prisma Studio
npm run db:generate       # Generate Prisma Client
```

---

## Known Issues

1. **ES Module Mocking**: 2 delete permission tests fail due to Jest ES module mocking limitations
   - Service logic is correct and works in production
   - Issue is with test setup, not business logic

---

## Recent Updates

### Version 1.4.0 (December 2025)
- Migration from SQLite to PostgreSQL
- Rebranded to "Kazi"
- Railway deployment configuration
- CORS configuration for multiple frontend ports
- Health check endpoint for monitoring

### Version 1.3.0
- Email-based invitation system
- Resend email integration
- Invitation management (accept/decline)
- Email notifications for invitations

### Version 1.2.0
- Complete Comment system with CRUD
- Role-based comment deletion (ADMIN/OWNER override)
- Chronological comment ordering

### Version 1.1.0
- Complete Task management module
- Task assignment functionality
- Comprehensive test suite (Jest + Supertest)
- Role-based permissions

### Version 1.0.0
- Authentication system with JWT
- Workspace management with RBAC
- Project management
- Database migrations with Prisma

---

## License

This project is for educational purposes.

---

## Support

For issues or questions, see the [main project README](../../README.md) or open an issue on GitHub.
