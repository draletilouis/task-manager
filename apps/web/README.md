# Task Manager Web Application

A modern, responsive React frontend for collaborative task management. Features drag-and-drop Kanban boards, real-time notifications, and comprehensive workspace management.

**Part of the Task Manager Monorepo** - See [root README](../../README.md) for full project documentation.

---

## Quick Start

```bash
# From project root
npm install
cd apps/web
cp .env.example .env
npm run dev:web
```

Web app runs on **http://localhost:5173** (or next available port)

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **Vite 7** | Build tool & dev server |
| **TailwindCSS 4** | Utility-first styling |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client |
| **@dnd-kit** | Drag-and-drop functionality |
| **Context API** | State management |
| **React Hook Form** | Form management |
| **React Hot Toast** | Toast notifications |
| **Lucide React** | Icon library |

---

## Features

### Authentication
- User registration with validation
- Login with JWT tokens
- Automatic token refresh
- Protected routes
- Persistent authentication (localStorage)
- Password strength meter
- Password change functionality

### Workspace Management
- Create, update, delete workspaces
- Email-based member invitations
- View and manage pending invitations
- Accept/decline workspace invitations
- Remove members
- Update member roles (OWNER, ADMIN, MEMBER)
- Role-based permissions
- Pagination with configurable page size
- Empty states with call-to-action

### Search Functionality
- Global search across workspaces, projects, and tasks
- Keyboard shortcut (Cmd/Ctrl + K)
- Real-time search results
- Navigate directly to resources
- Search modal with grouped results

### Project Management
- CRUD operations for projects
- Project assignment to workspaces
- Delete confirmation dialogs
- Toast notifications

### Task Management
- **Kanban board** with drag-and-drop
- Three columns: TODO, IN_PROGRESS, DONE
- Priority levels with visual indicators
- Task assignment to members
- Due date tracking
- Advanced filtering:
  - Filter by status, priority, assignee
  - Search by title/description
  - Sort by date, priority, title
- Inline task editing

### Comment System
- Add, edit, delete comments
- Chronological ordering
- Owner-only edits
- Role-based deletion permissions

### UI/UX
- Error boundary for graceful error handling
- Toast notification system (success, error, warning, info)
- Skeleton loading states
- Form validation with real-time feedback
- Responsive, mobile-first design
- Consistent styling with TailwindCSS

---

## Project Structure

```
apps/web/
├── src/
│   ├── components/
│   │   ├── auth/                # Login, Register forms
│   │   ├── layout/              # Navbar, Sidebar, Footer
│   │   ├── common/              # Reusable UI (Button, Input, Modal, Toast, Spinner, SearchModal, etc.)
│   │   ├── workspace/           # WorkspaceCard, WorkspaceList
│   │   ├── project/             # ProjectCard, ProjectForm
│   │   ├── task/                # TaskCard, TaskBoard, TaskForm, TaskFilterBar
│   │   └── comment/             # CommentForm, CommentList
│   ├── pages/
│   │   ├── auth/                # Login, Register, ForgotPassword pages
│   │   ├── workspaces/          # WorkspacesPage, WorkspaceDetail
│   │   ├── projects/            # ProjectDetail
│   │   ├── tasks/               # TaskDetail
│   │   ├── invitations/         # InvitationsPage
│   │   ├── profile/             # UserProfile
│   │   └── settings/            # SettingsPage
│   ├── context/
│   │   ├── AuthContext.jsx      # Authentication state
│   │   ├── ToastContext.jsx     # Toast notifications
│   │   └── WorkspaceContext.jsx # Workspace state
│   ├── hooks/
│   │   ├── useAuth.js           # Auth context hook
│   │   ├── useWorkspaces.js     # Workspace data fetching
│   │   ├── useProjects.js       # Project data fetching
│   │   ├── useTasks.js          # Task data fetching
│   │   ├── useComments.js       # Comment data fetching
│   │   └── useLocalStorage.js   # LocalStorage hook
│   ├── api/
│   │   ├── client.js            # Axios instance with interceptors
│   │   ├── auth.js              # Auth API calls
│   │   ├── workspaces.js        # Workspace API calls
│   │   ├── projects.js          # Project API calls
│   │   ├── tasks.js             # Task API calls
│   │   ├── comments.js          # Comment API calls
│   │   ├── invitations.js       # Invitation API calls
│   │   └── search.js            # Search API calls
│   ├── routes/
│   │   ├── index.jsx            # Route configuration
│   │   └── PrivateRoute.jsx     # Auth guard
│   ├── utils/
│   │   ├── constants.js         # App constants
│   │   ├── helpers.js           # Utility functions
│   │   ├── validation.js        # Validation functions
│   │   └── validators.js        # Form validators
│   ├── assets/                  # Static assets
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── public/                      # Public assets
├── .env                         # Environment variables
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
├── eslint.config.js             # ESLint rules
├── postcss.config.js            # PostCSS configuration
└── package.json
```

---

## State Management

### React Context API
- **AuthContext**: User authentication state, login/logout functions
- **ToastContext**: Global toast notifications
- **WorkspaceContext**: Current workspace state

### Custom Hooks
- Data fetching hooks for workspaces, projects, tasks, comments
- Automatic error handling and loading states
- Axios interceptors for token refresh

### API Client Architecture
- Axios instance with base URL from environment
- Request interceptor: Adds Bearer token
- Response interceptor:
  - Automatic token refresh on 401
  - Exponential backoff retry for network errors
  - User-friendly error messages

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
cd apps/web
cp .env.example .env

# Configure .env
VITE_API_URL=http://localhost:5000
```

### Running

```bash
# Development (from root)
npm run dev:web

# Build (from root)
npm run build:web

# Preview build
cd apps/web
npm run preview
```

### Linting

```bash
# From root
npm run lint

# From apps/web
npm run lint
npm run lint:fix
```

---

## Pending Tasks

### HIGH PRIORITY

#### Testing
- [ ] Set up Vitest + Testing Library
- [ ] Add component tests for common components
- [ ] Add integration tests for key user flows
- [ ] Add E2E tests (Playwright/Cypress)

#### Code Quality
- [ ] Migrate to TypeScript
- [ ] Add prop-types or TypeScript interfaces
- [ ] Consolidate validation utilities (validation.js + validators.js)
- [ ] Remove unused dependency (@tanstack/react-query)
- [ ] Add Storybook for component documentation

#### Performance
- [ ] Implement React.lazy for route-based code splitting
- [ ] Add service worker for offline support
- [ ] Optimize bundle size (currently 459KB)
- [ ] Add image optimization
- [ ] Implement virtual scrolling for long lists

### MEDIUM PRIORITY

#### Features
- [ ] Real-time collaboration (WebSockets)
- [ ] File attachments for tasks
- [ ] Rich text editor for descriptions (TipTap/Quill)
- [ ] Task tags/labels
- [ ] Bulk task operations
- [ ] Email notifications UI
- [ ] Export functionality (PDF, CSV)
- [ ] Advanced reporting/analytics dashboard

#### State Management
- [ ] Evaluate Context API scalability
- [ ] Consider migrating to Zustand/Jotai (lighter than Redux)
- [ ] Or properly utilize installed @tanstack/react-query

#### UI/UX
- [ ] Dark mode support
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Mobile-optimized navigation
- [ ] Progressive Web App (PWA) manifest
- [ ] Custom theme support
- [ ] Keyboard shortcuts

### LOW PRIORITY

#### Developer Experience
- [ ] Add component generators (Plop.js)
- [ ] Improve error boundaries with fallback UI
- [ ] Add development-only debug tools
- [ ] Create shared UI component library

#### Documentation
- [ ] Component documentation
- [ ] State management guide
- [ ] Styling guidelines
- [ ] Contributing guide

---

## Environment Variables

```bash
VITE_API_URL=http://localhost:5000
```

---

## Commands

From project root:

```bash
npm run dev:web           # Start dev server
npm run build:web         # Build for production
npm run lint              # Lint code
```

From apps/web:

```bash
npm run dev               # Start dev server (port 5173)
npm run build             # Build for production
npm run preview           # Preview production build
npm run lint              # Run ESLint
npm run lint:fix          # Fix ESLint issues
```

---

## Build Output

Production build is optimized and minified:
- Bundle size: **459KB** (gzipped: 143KB)
- Build time: ~3-4 seconds
- Output directory: `dist/`

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features
- CSS Grid and Flexbox

---

## Styling

### TailwindCSS
- Utility-first approach
- Custom configuration in `tailwind.config.js`
- PostCSS processing
- Responsive design with mobile-first breakpoints

### Global Styles
- Base styles in `index.css`
- Component-specific styles in `App.css`
- Consistent design system

---

## Known Issues

1. **@tanstack/react-query** is installed but not being used
   - Currently using custom hooks with Axios
   - Consider migration or removal

2. **Duplicate validation utilities**
   - `validation.js` and `validators.js` have overlapping functionality
   - Should be consolidated

---

## Recent Updates

### December 2025 - Version 1.4.0
- Rebranded to "Kazi"
- Global search functionality (Cmd/Ctrl + K)
- Invitation system (send, accept, decline invitations)
- Invitation management page
- Forgot password UI
- CORS fixes for multiple ports
- Updated navbar design (logo only)
- Railway deployment support

### December 2025 - Version 1.3.0
- User profile page with workspace statistics
- Settings page with password change
- Error boundary component
- Pagination on workspaces page
- Fixed all linting issues

### November 2025 - Version 1.2.0
- Drag-and-drop Kanban board
- Task filtering and search
- Comment system with full CRUD
- Toast notification system
- Skeleton loading states
- Password strength meter
- Form validation improvements

---

## License

This project is for educational purposes.

---

## Support

For issues or questions, see the [main project README](../../README.md) or open an issue on GitHub.
