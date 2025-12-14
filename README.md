# Task Manager - Full Stack Application

A modern, collaborative task management system built with React and Node.js. Features workspaces, projects, tasks with Kanban boards, and real-time collaboration.

**Monorepo Architecture** | **JWT Authentication** | **96.5% Test Coverage** | **Modern UI/UX**

---

## Quick Start

```bash
# Install all dependencies
npm install

# Set up environment files
cd apps/api && cp .env.example .env
cd ../web && cp .env.example .env

# Initialize database
npm run db:generate
npm run db:migrate

# Start both frontend and backend
npm run dev
```

**API**: http://localhost:5000
**Web**: http://localhost:5173

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
| **SQLite** | Development database |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |
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
- Protected routes with auto-redirect
- Persistent authentication via localStorage

### Workspace Management
- Create, update, and delete workspaces
- Role-based access control (OWNER, ADMIN, MEMBER)
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

### UI/UX
- **Modern Desktop Layout**
  - Collapsible sidebar navigation (w-72 expanded, w-16 collapsed)
  - Dark themed sidebar with workspace/project tree
  - Responsive navbar with search button (⌘K hint)
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

### Best Practices
- SQL injection prevention (Prisma ORM)
- Input validation and sanitization
- Email format validation
- CORS ready for production

---

## Testing

**Overall Coverage**: 56/58 tests passing (96.5%)

| Module | Tests | Status |
|--------|-------|--------|
| Task Service | 14/16 | 88% |
| Task Routes | 15/15 | 100% |
| Comment Service | 12/12 | 100% |
| Comment Routes | 15/15 | 100% |

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
```

### Workspaces
```http
POST   /workspaces                              # Create workspace
GET    /workspaces                              # List user workspaces
PUT    /workspaces/:workspaceId                 # Update workspace (OWNER/ADMIN)
DELETE /workspaces/:workspaceId                 # Delete workspace (OWNER)
POST   /workspaces/:workspaceId/members         # Invite member (OWNER/ADMIN)
DELETE /workspaces/:workspaceId/members/:userId # Remove member (OWNER/ADMIN)
PUT    /workspaces/:workspaceId/members/:userId # Update role (OWNER)
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

## Pending Tasks & Roadmap

### HIGH PRIORITY

#### Infrastructure & DevOps
- [ ] Create `.env.example` files for both apps
- [ ] Add Docker support (Dockerfile + docker-compose.yml)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add health check endpoint (`GET /health`)
- [ ] Configure environment-specific builds

#### Security Enhancements
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Add request validation middleware (express-validator)
- [ ] Configure CORS properly
- [ ] Add helmet.js for security headers
- [ ] Implement request logging (Winston/Pino)
- [ ] Add error tracking (Sentry)

#### Testing
- [ ] Add tests for Auth module (0% coverage)
- [ ] Add tests for Workspace module (0% coverage)
- [ ] Add tests for Project module (0% coverage)
- [ ] Set up frontend testing (Vitest + Testing Library)
- [ ] Add E2E tests (Playwright/Cypress)
- [ ] Set up test coverage thresholds in CI

### MEDIUM PRIORITY

#### Features
- [ ] **Activity Log System** (schema exists, not implemented)
  - Track all CRUD operations
  - Activity feed per workspace
  - User activity history
  - Audit trail for compliance
- [ ] File attachments for tasks
- [ ] Rich text editor for task descriptions (TipTap/Quill)
- [ ] Task tags/labels system
- [ ] Bulk task operations
- [ ] Email notifications
- [ ] Export functionality (PDF, CSV)

#### Code Quality
- [ ] Migrate to TypeScript (gradual)
- [ ] Add JSDoc comments to backend functions
- [ ] Consolidate validation utilities (validation.js + validators.js)
- [ ] Remove unused dependency (@tanstack/react-query)
- [ ] Add Storybook for component documentation
- [ ] Set up pre-commit hooks (Husky + lint-staged)

#### Performance
- [ ] Implement caching layer (Redis)
- [ ] Add database indexes on foreign keys
- [ ] Database connection pooling
- [ ] Implement pagination on all list endpoints
- [ ] Add lazy loading for frontend routes
- [ ] Optimize bundle size (code splitting)

### LOW PRIORITY

#### Documentation
- [ ] Create OpenAPI/Swagger specification
- [ ] Expand frontend README
- [ ] Create CONTRIBUTING.md
- [ ] Create DEPLOYMENT.md
- [ ] Add architecture diagrams
- [ ] Create troubleshooting guide

#### Developer Experience
- [ ] Create shared packages (`packages/shared`, `packages/ui`)
- [ ] Add build optimization (Turborepo/Nx)
- [ ] Improve error messages
- [ ] Add development seed data script
- [ ] Create project templates/generators

#### UI/UX Enhancements
- [ ] Dark mode support
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Mobile-optimized navigation
- [ ] Progressive Web App (PWA) support
- [ ] Offline mode with service workers
- [ ] Real-time collaboration (WebSockets)

---

## Recent Updates

### December 2025 - Desktop UI Enhancements
- **Sidebar Navigation**
  - Implemented collapsible sidebar with dark theme (gray-900)
  - Dynamic workspace tree with expandable projects
  - On-demand project loading when workspace expanded
  - Quick links to Profile and Settings
  - Smooth transition animations
- **Layout Improvements**
  - Constrained content width for better readability (max-w-6xl)
  - Increased font sizes across the application
  - Professional spacing and padding (py-12, px-8)
  - 2-column workspace grid with larger cards
  - Enhanced WorkspaceCard with bigger icons (w-16 h-16)
- **Typography Polish**
  - Larger headings (text-4xl for page titles)
  - Improved font weights and line heights
  - Better text hierarchy throughout
  - Consistent base font size (text-base)

### December 2025 - Monorepo Migration
- Migrated to npm workspaces monorepo structure
- Renamed `backend/` to `apps/api/`
- Renamed `frontend/` to `apps/web/`
- Created unified workspace scripts
- Updated all documentation

### December 2025 - User Profile & Settings
- User profile page with workspace statistics
- Settings page with password change
- Password change API endpoint
- Error boundary component

### November 2025 - Pagination & Polish
- Pagination on workspaces page
- Fixed all linting issues
- Optimized frontend build (459KB)
- Form validation improvements

### November 2025 - Task Features
- Drag-and-drop Kanban board
- Task filtering and search
- Comment system with full CRUD
- Toast notification system
- Skeleton loading states

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
