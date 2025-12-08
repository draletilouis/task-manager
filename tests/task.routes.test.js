import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock the task service
const mockTaskService = {
    createTask: jest.fn(),
    getTasks: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
};

jest.unstable_mockModule('../src/modules/tasks/task.service.js', () => mockTaskService);

// Mock auth middleware
jest.unstable_mockModule('../src/modules/auth/auth.middleware.js', () => ({
    authMiddleware: (req, _res, next) => {
        req.user = { userId: 'test-user-123' };
        next();
    },
}));

// Import routes after mocking
const { default: taskRoutes } = await import('../src/modules/tasks/task.routes.js');

// Create test app
const app = express();
app.use(express.json());
app.use('/', taskRoutes);

describe('Task Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /:workspaceId/projects/:projectId/tasks', () => {
        it('should create a task and return 201', async () => {
            const taskData = {
                title: 'Test Task',
                description: 'Test Description',
                status: 'TODO',
                priority: 'HIGH',
            };

            const mockResponse = {
                message: 'Task created successfully',
                task: {
                    id: 'task-123',
                    ...taskData,
                    projectId: 'project-123',
                    createdBy: 'test-user-123',
                    createdAt: new Date(),
                },
            };

            mockTaskService.createTask.mockResolvedValueOnce(mockResponse);

            const response = await request(app)
                .post('/workspace-123/projects/project-123/tasks')
                .send(taskData);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Task created successfully');
            expect(response.body.task.title).toBe('Test Task');
        });

        it('should return 400 on validation error', async () => {
            mockTaskService.createTask.mockRejectedValueOnce(new Error('Task title is required'));

            const response = await request(app)
                .post('/workspace-123/projects/project-123/tasks')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Task title is required');
        });

        it('should return 400 when user lacks permission', async () => {
            mockTaskService.createTask.mockRejectedValueOnce(
                new Error('You do not have permission to create tasks in this workspace')
            );

            const response = await request(app)
                .post('/workspace-123/projects/project-123/tasks')
                .send({ title: 'Test' });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('permission');
        });
    });

    describe('GET /:workspaceId/projects/:projectId/tasks', () => {
        it('should get all tasks and return 200', async () => {
            const mockTasks = {
                tasks: [
                    {
                        id: 'task-1',
                        title: 'Task 1',
                        status: 'TODO',
                        priority: 'HIGH',
                        projectId: 'project-123',
                    },
                    {
                        id: 'task-2',
                        title: 'Task 2',
                        status: 'IN_PROGRESS',
                        priority: 'MEDIUM',
                        projectId: 'project-123',
                    },
                ],
            };

            mockTaskService.getTasks.mockResolvedValueOnce(mockTasks);

            const response = await request(app).get('/workspace-123/projects/project-123/tasks');

            expect(response.status).toBe(200);
            expect(response.body.tasks).toHaveLength(2);
            expect(response.body.tasks[0].title).toBe('Task 1');
        });

        it('should return 400 when user lacks permission', async () => {
            mockTaskService.getTasks.mockRejectedValueOnce(
                new Error('You do not have permission to view tasks in this workspace')
            );

            const response = await request(app).get('/workspace-123/projects/project-123/tasks');

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('permission');
        });

        it('should return 400 when project not found', async () => {
            mockTaskService.getTasks.mockRejectedValueOnce(
                new Error('Project not found in this workspace')
            );

            const response = await request(app).get('/workspace-123/projects/project-123/tasks');

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Project not found in this workspace');
        });
    });

    describe('PUT /:workspaceId/projects/:projectId/tasks/:taskId', () => {
        it('should update a task and return 200', async () => {
            const updateData = {
                title: 'Updated Task',
                status: 'IN_PROGRESS',
            };

            const mockResponse = {
                message: 'Task updated successfully',
                task: {
                    id: 'task-123',
                    ...updateData,
                    projectId: 'project-123',
                    updatedAt: new Date(),
                },
            };

            mockTaskService.updateTask.mockResolvedValueOnce(mockResponse);

            const response = await request(app)
                .put('/workspace-123/projects/project-123/tasks/task-123')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Task updated successfully');
            expect(response.body.task.title).toBe('Updated Task');
        });

        it('should return 400 on validation error', async () => {
            mockTaskService.updateTask.mockRejectedValueOnce(
                new Error('Invalid task status')
            );

            const response = await request(app)
                .put('/workspace-123/projects/project-123/tasks/task-123')
                .send({ status: 'INVALID' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid task status');
        });

        it('should return 400 when task not found', async () => {
            mockTaskService.updateTask.mockRejectedValueOnce(
                new Error('Task not found in this project')
            );

            const response = await request(app)
                .put('/workspace-123/projects/project-123/tasks/task-123')
                .send({ title: 'Updated' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Task not found in this project');
        });

        it('should handle partial updates', async () => {
            const mockResponse = {
                message: 'Task updated successfully',
                task: {
                    id: 'task-123',
                    title: 'Original Title',
                    status: 'DONE',
                    projectId: 'project-123',
                },
            };

            mockTaskService.updateTask.mockResolvedValueOnce(mockResponse);

            const response = await request(app)
                .put('/workspace-123/projects/project-123/tasks/task-123')
                .send({ status: 'DONE' });

            expect(response.status).toBe(200);
            expect(response.body.task.status).toBe('DONE');
        });
    });

    describe('DELETE /:workspaceId/projects/:projectId/tasks/:taskId', () => {
        it('should delete a task and return 200', async () => {
            const mockResponse = { message: 'Task deleted successfully' };

            mockTaskService.deleteTask.mockResolvedValueOnce(mockResponse);

            const response = await request(app).delete('/workspace-123/projects/project-123/tasks/task-123');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Task deleted successfully');
        });

        it('should return 400 when user lacks permission', async () => {
            mockTaskService.deleteTask.mockRejectedValueOnce(
                new Error('You do not have permission to delete this task')
            );

            const response = await request(app).delete('/workspace-123/projects/project-123/tasks/task-123');

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('permission');
        });

        it('should return 400 when task not found', async () => {
            mockTaskService.deleteTask.mockRejectedValueOnce(
                new Error('Task not found in this project')
            );

            const response = await request(app).delete('/workspace-123/projects/project-123/tasks/task-123');

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Task not found in this project');
        });

        it('should return 400 when project not found', async () => {
            mockTaskService.deleteTask.mockRejectedValueOnce(
                new Error('Project not found in this workspace')
            );

            const response = await request(app).delete('/workspace-123/projects/project-123/tasks/task-123');

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Project not found in this workspace');
        });
    });

    describe('Authentication', () => {
        it('should pass authenticated user ID to all endpoints', async () => {
            mockTaskService.createTask.mockResolvedValueOnce({
                message: 'Task created successfully',
                task: { id: 'task-123' },
            });

            await request(app)
                .post('/workspace-123/projects/project-123/tasks')
                .send({ title: 'Test Task' });

            expect(mockTaskService.createTask).toHaveBeenCalled();
        });
    });
});
