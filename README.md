# Kazi - Full Stack Task Management Application

A modern, collaborative task management system built with React and Node.js. Features workspaces, projects, tasks with Kanban boards, team collaboration, and transactional email notifications.

**Monorepo Architecture** | **JWT Authentication** | **PostgreSQL Database** | **100% Test Coverage** | **Email Integration** | **Global Search** | **Modern UI/UX**

## Project Status

🟢 **Production Ready** - Core features complete with comprehensive testing

| Feature | Status | Coverage |
|---------|--------|----------|
| **Authentication** | ✅ Complete | 100% tested (39 tests) |
| **Workspaces** | ✅ Complete | 100% tested (27 tests) |
| **Projects** | ✅ Complete | 100% tested (20 tests) |
| **Tasks & Kanban** | ✅ Complete | 100% tested (31 tests) |
| **Comments** | ✅ Complete | 100% tested (27 tests) |
| **Invitations** | ✅ Complete | Email-based workspace invites |
| **Global Search** | ✅ Complete | Search workspaces, projects, tasks |
| **Email Service** | ✅ Complete | Resend integration active |
| **Input Validation** | ✅ Complete | All routes protected |
| **Password Reset** | ✅ Complete | Email-based flow |
| **API Documentation** | ✅ Complete | All endpoints documented |

**Total Test Suite**: 144/144 tests passing ✅

---

## Quick Start

**Prerequisites:**
- Node.js **20.19+** or **22.12+** (required by Vite 7)
- npm 9.0.0 or higher
- PostgreSQL database

```bash
# Install all dependencies
npm install

# Set up environment files (see Database Setup section below)
# Create apps/api/.env with your DATABASE_URL

# Initialize database
npm run db:generate
npm run db:migrate

# Start both frontend and backend
npm run dev
```

**API**: http://localhost:5000
**Web**: http://localhost:5173

### Database Setup

You'll need a PostgreSQL database. Choose one of these options:

**Option 1: Cloud PostgreSQL (Recommended)**
- **Supabase** (Free tier: 500MB): [supabase.com](https://supabase.com)
- **Neon** (Free tier: 0.5GB): [neon.tech](https://neon.tech)
- **Railway** ($5/month credit): [railway.app](https://railway.app)

**Option 2: Local PostgreSQL**
- Install PostgreSQL locally
- Create database: `createdb task_manager`

Then create `apps/api/.env` (see [apps/api/.env.example](apps/api/.env.example)):
```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/database_name"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-token-key-change-this-in-production"

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS and email links) - supports multiple ports
FRONTEND_URL="http://localhost:5173,http://localhost:5174,http://localhost:5175"

# Email Configuration (Resend)
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="Kazi <onboarding@resend.dev>"
APP_URL="http://localhost:5173"
```

---

## Project Structure

This is a **monorepo using npm workspaces** for unified dependency management and development workflow.

```
task-manager/
├── apps/
│   ├── api/                  # Express + Prisma REST API
│   │   ├── src/
│   │   │   ├── modules/      # Feature modules (auth, workspaces, projects, tasks, comments)
│   │   │   ├── database/     # Prisma client
│   │   │   └── shared/       # Utilities & middleware
│   │   ├── tests/            # Jest + Supertest
│   │   └── prisma/           # Database schema & migrations
│   │
│   └── web/                  # React + Vite SPA
│       ├── src/
│       │   ├── components/   # UI components (auth, layout, common, workspace, project, task, comment)
│       │   ├── pages/        # Route pages
│       │   ├── context/      # React Context (Auth, Toast, Workspace)
│       │   ├── hooks/        # Custom hooks (useAuth, useWorkspaces, useTasks, etc.)
│       │   ├── api/          # API client & services
│       │   └── utils/        # Helpers & validators
│       └── public/
│
├── package.json              # Workspace root
└── .prettierrc               # Shared config
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime (ES modules) |
| **Express 5** | REST API framework |
| **Prisma ORM** | Type-safe database toolkit |
| **PostgreSQL** | Production database |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |
| **Resend** | Transactional email service |
| **Jest + Supertest** | Testing |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **Vite 7** | Build tool & dev server |
| **TailwindCSS 4** | Utility-first styling |
| **React Router 7** | Client-side routing |
| **Lucide React** | Icon library |
| **Axios** | HTTP client |
| **@dnd-kit** | Drag-and-drop |
| **Context API** | State management |
| **React Hook Form** | Form management |
| **React Hot Toast** | Notifications |

---

## Features

### Authentication & User Management
- JWT-based auth with access (15min) + refresh tokens (7 days)
- User registration with email validation
- Strong password requirements
- Password change functionality
- **Password reset via email** (forgot password flow)
- Secure reset tokens with 1-hour expiry
- Protected routes with auto-redirect
- Persistent authentication via localStorage

### Workspace Management
- Create, update, and delete workspaces
- Role-based access control (OWNER, ADMIN, MEMBER)
- **Email-based member invitations** with Resend integration
- Accept/decline workspace invitations
- Pending invitation management
- Invite/remove members
- Update member roles
- Pagination for workspace lists

### Project Management
- Full CRUD operations within workspaces
- Member-only access
- Role-based permissions
- Delete confirmation dialogs

### Task Management
- **Kanban board** with drag-and-drop
- Three status columns: TODO, IN_PROGRESS, DONE
- Priority levels: LOW, MEDIUM, HIGH
- Task assignment to members
- Due date tracking
- Advanced filtering:
  - Filter by status, priority, assignee
  - Search by title/description
  - Sort by date, priority, or title

### Comment System
- Add, edit, delete comments on tasks
- Chronological ordering
- Owner-only edits
- Role-based deletion (ADMIN/OWNER override)

### Search & Navigation
- **Global search** across workspaces, projects, and tasks
- **Keyboard shortcut** (Cmd/Ctrl + K) for quick access
- Real-time search results with instant navigation
- Grouped results by resource type
- Search modal with modern UI

### UI/UX
- **Authentication Pages**
  - 50/50 split design with branding side and form side
  - Gradient blue branding panel with Kazi logo
  - Single-screen layout with no scrolling required
  - Forgot password flow with email reset
  - Responsive design (mobile-friendly)
  - Smooth color transitions and professional styling
- **Modern Desktop Layout**
  - Collapsible sidebar navigation (w-72 expanded, w-16 collapsed)
  - Dark themed sidebar with workspace/project tree
  - Clean navbar with Kazi logo and search shortcut (⌘K)
  - Global search modal with keyboard navigation
  - Professional spacing and typography
  - Constrained content width (max-w-6xl) for optimal readability
- **Component Library**
  - Reusable Button, Modal, Toast components
  - WorkspaceCard with gradient headers and hover effects
  - Skeleton loading states
  - Error boundary for graceful error handling
- **User Experience**
  - Toast notification system
  - Password strength meter
  - Real-time form validation with error messages
  - Loading states throughout
  - Responsive grid layouts (2-column on desktop)
  - Smooth transitions and hover effects

---

## Monorepo Commands

All commands run from **root directory**:

### Development
```bash
npm run dev              # Start both API + Web
npm run dev:api          # Start API only
npm run dev:web          # Start Web only
```

### Building
```bash
npm run build            # Build all apps
npm run build:api        # Build API
npm run build:web        # Build Web (459KB optimized)
```

### Testing
```bash
npm test                 # Test all apps
npm run test:api         # Test API (96.5% passing)
npm run test:web         # Test Web
```

### Database
```bash
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:generate      # Generate Prisma Client
```

### Code Quality
```bash
npm run lint             # Lint all code
npm run format           # Format with Prettier
```

---

## Security

### Authentication
- JWT access tokens (15min expiry)
- JWT refresh tokens (7 days expiry)
- Automatic token refresh via axios interceptors
- HTTP-only cookie support ready

### Password Security
- bcrypt hashing (10 salt rounds)
- Password requirements:
  - Minimum 8 characters
  - 1+ uppercase, 1+ lowercase, 1+ number

### Authorization
- Role-based access control (RBAC)
- Protected routes with auth middleware
- Owner/Admin/Member hierarchical permissions
- Workspace membership validation

### Input Validation & Sanitization ✅
- **express-validator** middleware on all endpoints
- Comprehensive validation rules for all request inputs
- XSS prevention through input sanitization
- Field-level validation with detailed error messages
- Email normalization and format validation
- String length limits to prevent buffer overflow
- Type checking and enum validation
- Custom validation rules for complex business logic

### Best Practices
- SQL injection prevention (Prisma ORM)
- Automated input validation and sanitization
- Email format validation and normalization
- CORS ready for production

---

## Testing

**Overall Coverage**: **144/144 tests passing (100%)** ✅

| Module | Tests | Status |
|--------|-------|--------|
| **Auth Service** | 23/23 | ✅ 100% |
| **Auth Routes** | 16/16 | ✅ 100% |
| **Workspace Service** | 27/27 | ✅ 100% |
| **Project Service** | 20/20 | ✅ 100% |
| **Task Service** | 16/16 | ✅ 100% |
| **Task Routes** | 15/15 | ✅ 100% |
| **Comment Service** | 12/12 | ✅ 100% |
| **Comment Routes** | 15/15 | ✅ 100% |

```bash
npm run test:api                    # Run all tests
npm run test:api -- task.service    # Run specific test
npm run test:api -- --coverage      # Coverage report
```

---

## API Documentation

### Authentication
```http
POST   /auth/register          # Register new user
POST   /auth/login             # Login user
POST   /auth/refresh           # Refresh access token
POST   /auth/change-password   # Change password (protected)
POST   /auth/forgot-password   # Request password reset email
POST   /auth/reset-password    # Reset password with token
```

### Workspaces
```http
POST   /workspaces                              # Create workspace
GET    /workspaces                              # List user workspaces
GET    /workspaces/:workspaceId/members         # Get workspace members
PUT    /workspaces/:workspaceId                 # Update workspace (OWNER/ADMIN)
DELETE /workspaces/:workspaceId                 # Delete workspace (OWNER)
DELETE /workspaces/:workspaceId/members/:userId # Remove member (OWNER/ADMIN)
PUT    /workspaces/:workspaceId/members/:userId # Update role (OWNER)
```

### Invitations
```http
POST   /invitations                        # Send workspace invitation via email
GET    /invitations                        # List user invitations
GET    /invitations/pending                # List pending invitations
POST   /invitations/:invitationId/accept   # Accept invitation
POST   /invitations/:invitationId/decline  # Decline invitation
DELETE /invitations/:invitationId          # Delete invitation
```

### Search
```http
GET    /search?q=query                     # Global search across resources
```

### Projects
```http
POST   /workspaces/:workspaceId/projects              # Create project
GET    /workspaces/:workspaceId/projects              # List projects
PUT    /workspaces/:workspaceId/projects/:projectId   # Update project (OWNER/ADMIN)
DELETE /workspaces/:workspaceId/projects/:projectId   # Delete project (OWNER/ADMIN)
```

### Tasks
```http
POST   /workspaces/:workspaceId/projects/:projectId/tasks          # Create task
GET    /workspaces/:workspaceId/projects/:projectId/tasks          # List tasks
GET    /workspaces/:workspaceId/projects/:projectId/tasks/:taskId  # Get single task
PUT    /workspaces/:workspaceId/projects/:projectId/tasks/:taskId  # Update task
DELETE /workspaces/:workspaceId/projects/:projectId/tasks/:taskId  # Delete task
```

### Comments
```http
POST   /workspaces/tasks/:taskId/comments    # Add comment
GET    /workspaces/tasks/:taskId/comments    # List comments
PUT    /workspaces/comments/:commentId       # Update comment (owner only)
DELETE /workspaces/comments/:commentId       # Delete comment (owner/ADMIN/OWNER)
```

---

## Upcoming Roadmap

### Next 5 Weeks (Starting December 20, 2025)

- **Week 1 (Dec 20-26)**: Docker Support & Deployment Setup
- **Week 2 (Dec 27-Jan 2)**: Rate Limiting & Security Headers (Helmet.js)
- **Week 3 (Jan 3-9)**: Frontend Testing Suite (Vitest + Testing Library)
- **Week 4 (Jan 10-16)**: Activity Log System Implementation
- **Week 5 (Jan 17-23)**: E2E Testing (Playwright/Cypress)

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is for educational purposes.

---

## Additional Documentation

- **API Documentation**: [apps/api/README.md](apps/api/README.md)
- **Web Documentation**: [apps/web/README.md](apps/web/README.md)

---

## Support

For questions, issues, or feature requests, please [open an issue](https://github.com/yourusername/task-manager/issues) on GitHub.
