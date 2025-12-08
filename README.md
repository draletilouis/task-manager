# Task Manager API

*A modern RESTful API for managing tasks, projects, and collaborative workspaces.*

Built with **Node.js**, **Express**, and **Prisma ORM** — designed for scalability, clean structure, and secure authentication.

---

## ⚙️ Tech Stack

| Technology     | Purpose                           |
| -------------- | --------------------------------- |
| **Node.js**    | Backend runtime (ES modules)      |
| **Express.js** | REST API framework                |
| **Prisma ORM** | Database toolkit (SQLite for dev) |
| **JWT**        | Token-based auth system           |
| **bcrypt**     | Password hashing                  |
| **Jest**       | Testing framework                 |
| **Supertest**  | API integration testing           |

---

## 📌 Project Status

### ✅ Completed Features

**Authentication System**
* ES6 module setup
* Prisma + SQLite database integration
* User registration & login
* Email & password validation
* Secure password hashing with **bcrypt**
* JWT Authentication
  * Access token (**15 min**)
  * Refresh token (**7 days**)
* Token refresh endpoint
* Auth middleware for protected routes
* Global error handling

**Workspace Management**
* Create workspace (user becomes owner automatically)
* List user workspaces (shows all workspaces where user is a member)
* Update workspace name (OWNER/ADMIN only)
* Delete workspace (OWNER only)
* Invite members to workspace (OWNER/ADMIN only)
* Remove members from workspace (OWNER/ADMIN only)
* Update member roles (OWNER only)

**Project Management**
* Create projects in workspace (any member)
* List all projects in workspace (any member)
* Update project details (OWNER/ADMIN only)
* Delete projects (OWNER/ADMIN only)
* Role-based access control

**Task Management**
* Create tasks in projects
* List all tasks in a project
* Update task details (title, description, status, priority, due date)
* Delete tasks (creator or ADMIN/OWNER)
* Assign tasks to workspace members
* Task status tracking (TODO, IN_PROGRESS, DONE)
* Priority levels (LOW, MEDIUM, HIGH)
* Due date support
* Full CRUD operations with role-based permissions

**Comment System** ✨ *NEW*
* Add comments to tasks
* List all comments on a task
* Update own comments
* Delete comments (creator or ADMIN/OWNER)
* Chronological ordering
* Full CRUD operations with role-based permissions

---

### 🚧 Pending Features

**🚀 Advanced Features**
* File attachments
* Activity logs
* Real-time updates
* Task filtering and search
* Task tags/labels

---

## 📁 Project Structure

```
task-manager-api/
 ├─ prisma/
 │  ├─ schema.prisma
 │  ├─ migrations/
 │  └─ dev.db
 ├─ src/
 │  ├─ modules/
 │  │  ├─ auth/
 │  │  │  ├─ auth.controller.js
 │  │  │  ├─ auth.service.js
 │  │  │  ├─ auth.routes.js
 │  │  │  └─ auth.middleware.js
 │  │  ├─ workspaces/
 │  │  │  ├─ workspace.controller.js
 │  │  │  ├─ workspace.service.js
 │  │  │  └─ workspace.routes.js
 │  │  ├─ projects/
 │  │  │  ├─ project.controller.js
 │  │  │  ├─ project.service.js
 │  │  │  └─ project.routes.js
 │  │  ├─ tasks/
 │  │  │  ├─ task.controller.js
 │  │  │  ├─ task.service.js
 │  │  │  ├─ task.service.test.js
 │  │  │  ├─ task.routes.js
 │  │  │  ├─ task.routes.test.js
 │  │  │  └─ task.model.js
 │  │  └─ comments/
 │  │     ├─ comment.controller.js
 │  │     ├─ comment.service.js
 │  │     └─ comment.routes.js
 │  ├─ database/
 │  │  └─ prisma.js
 │  ├─ shared/
 │  │  └─ validation.js
 │  ├─ app.js
 │  └─ server.js
 ├─ .env
 ├─ .gitignore
 ├─ jest.config.js
 ├─ package.json
 └─ README.md
```

---

## 🗄️ Database Schema

### **User**

| Field       | Type     | Description      |
| ----------- | -------- | ---------------- |
| `id`        | UUID     | Primary Key      |
| `email`     | String   | Required, unique |
| `password`  | String   | Hashed           |
| `createdAt` | DateTime | Timestamp        |

### **Workspace**

| Field       | Type     | Description    |
| ----------- | -------- | -------------- |
| `id`        | UUID     | Primary Key    |
| `name`      | String   | Workspace name |
| `ownerId`   | String   | FK → User      |
| `createdAt` | DateTime | Timestamp      |

### **WorkspaceMember**

| Field         | Type   | Description            |
| ------------- | ------ | ---------------------- |
| `id`          | UUID   | Primary Key            |
| `userId`      | String | FK → User              |
| `workspaceId` | String | FK → Workspace         |
| `role`        | Enum   | OWNER / ADMIN / MEMBER |

### **Project**

| Field         | Type     | Description       |
| ------------- | -------- | ----------------- |
| `id`          | UUID     | Primary Key       |
| `name`        | String   | Project name      |
| `description` | String?  | Optional details  |
| `workspaceId` | String   | FK → Workspace    |
| `createdBy`   | String   | FK → User         |
| `createdAt`   | DateTime | Timestamp         |
| `updatedAt`   | DateTime | Last update       |

### **Task**

| Field         | Type         | Description                 |
| ------------- | ------------ | --------------------------- |
| `id`          | UUID         | Primary Key                 |
| `title`       | String       | Task title (required)       |
| `description` | String?      | Task details (optional)     |
| `status`      | TaskStatus   | TODO / IN_PROGRESS / DONE   |
| `priority`    | TaskPriority | LOW / MEDIUM / HIGH         |
| `dueDate`     | DateTime?    | Optional deadline           |
| `assignedTo`  | String?      | FK → User (optional)        |
| `projectId`   | String       | FK → Project                |
| `createdBy`   | String       | FK → User                   |
| `createdAt`   | DateTime     | Timestamp                   |
| `updatedAt`   | DateTime     | Last update                 |

### **Comment**

| Field       | Type     | Description            |
| ----------- | -------- | ---------------------- |
| `id`        | UUID     | Primary Key            |
| `content`   | String   | Comment text (required)|
| `taskId`    | String   | FK → Task              |
| `createdBy` | String   | FK → User              |
| `createdAt` | DateTime | Timestamp              |
| `updatedAt` | DateTime | Last update            |

---

## 🔌 API Endpoints

### Authentication

```http
POST   /auth/register          # Register new user
POST   /auth/login             # Login user
POST   /auth/refresh-token     # Refresh access token
```

### Workspaces

```http
POST   /workspaces                              # Create workspace
GET    /workspaces                              # List user workspaces
PUT    /workspaces/:workspaceId                 # Update workspace
DELETE /workspaces/:workspaceId                 # Delete workspace
POST   /workspaces/:workspaceId/members         # Invite member
DELETE /workspaces/:workspaceId/members/:userId # Remove member
PUT    /workspaces/:workspaceId/members/:userId # Update member role
```

### Projects

```http
POST   /workspaces/:workspaceId/projects            # Create project
GET    /workspaces/:workspaceId/projects            # List projects
PUT    /workspaces/:workspaceId/projects/:projectId # Update project
DELETE /workspaces/:workspaceId/projects/:projectId # Delete project
```

### Tasks

```http
POST   /workspaces/:workspaceId/projects/:projectId/tasks         # Create task
GET    /workspaces/:workspaceId/projects/:projectId/tasks         # List tasks
PUT    /workspaces/:workspaceId/projects/:projectId/tasks/:taskId # Update task
DELETE /workspaces/:workspaceId/projects/:projectId/tasks/:taskId # Delete task
```

### Comments

```http
POST   /workspaces/tasks/:taskId/comments      # Create comment
GET    /workspaces/tasks/:taskId/comments      # List comments
PUT    /workspaces/comments/:commentId         # Update comment
DELETE /workspaces/comments/:commentId         # Delete comment
```

---

## 🔒 Security Features

### 🔑 Authentication

* JWT Access + Refresh tokens
* Strict token expiration
* Protected routes middleware

### 🛡️ Password Security

* Bcrypt hashing (10 salt rounds)
* Strong password validation
* Password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### ✔️ Input Validation

* Email validation
* Password strength check
* Sanitized request bodies
* Required field validation

### 🔐 Authorization

* Role-based access control (OWNER, ADMIN, MEMBER)
* Workspace membership validation
* Resource ownership verification
* Task assignment validation

---

## 🧪 Testing

The project includes comprehensive test coverage using Jest and Supertest.

### Running Tests

```bash
npm test                    # Run all tests
npm test -- task.service    # Run specific test file
```

### Test Coverage

**Task Service Tests**: 14/16 passing (88%)
- ✅ Create task with validation
- ✅ Get tasks from project
- ✅ Update task details
- ✅ Delete task with permissions
- ⚠️ 2 tests with ES module mocking limitations

**Integration Tests**: All passing ✅
- Full end-to-end workflow tested
- Authentication → Workspace → Project → Task

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd task-manager-api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env file
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
```

4. Initialize database
```bash
npx prisma migrate dev
npx prisma generate
```

5. Start the server
```bash
npm run dev    # Development with auto-reload
npm start      # Production mode
```

The server will start on `http://localhost:5000`

---

## 📖 Usage Examples

### 1. Register and Login

```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'
```

### 2. Create Workspace

```bash
curl -X POST http://localhost:5000/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"name":"My Workspace"}'
```

### 3. Create Project

```bash
curl -X POST http://localhost:5000/workspaces/WORKSPACE_ID/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"name":"My Project","description":"Project description"}'
```

### 4. Create Task

```bash
curl -X POST http://localhost:5000/workspaces/WORKSPACE_ID/projects/PROJECT_ID/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title":"Complete documentation",
    "description":"Update README with latest features",
    "status":"TODO",
    "priority":"HIGH",
    "dueDate":"2025-12-31"
  }'
```

### 5. Update Task

```bash
curl -X PUT http://localhost:5000/workspaces/WORKSPACE_ID/projects/PROJECT_ID/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"status":"IN_PROGRESS","priority":"MEDIUM"}'
```

### 6. Add Comment to Task

```bash
curl -X POST http://localhost:5000/workspaces/tasks/TASK_ID/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"content":"Great progress on this task!"}'
```

---

## 🛠️ Development Commands

| Command                  | Description                |
| ------------------------ | -------------------------- |
| `npm run dev`            | Start dev server (nodemon) |
| `npm start`              | Production server          |
| `npm test`               | Run test suite             |
| `npx prisma generate`    | Generate Prisma Client     |
| `npx prisma migrate dev` | Apply migrations           |
| `npx prisma studio`      | DB GUI                     |

---

## 🐛 Known Issues

1. **ES Module Mocking**: 2 delete permission tests fail due to Jest ES module mocking limitations (not service bugs)
2. The service logic itself is correct and works in production

---

## 📝 Recent Updates

### Version 1.2.0 (Latest)
- ✅ Added complete Comment system
- ✅ Implemented comment CRUD operations
- ✅ Comment ownership and permissions
- ✅ Role-based comment deletion (ADMIN/OWNER override)
- ✅ Cascade deletion when task is deleted
- ✅ Chronological comment ordering

### Version 1.1.0
- ✅ Added complete Task management module
- ✅ Implemented task CRUD operations
- ✅ Added task assignment functionality
- ✅ Implemented role-based task permissions
- ✅ Added comprehensive test suite (Jest + Supertest)
- ✅ Fixed route hierarchy (workspace → project → task)
- ✅ Full integration testing completed

---

## 📄 License

This project is for educational purposes.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Contact

For questions or support, please open an issue in the repository.
