import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock the comment service
const mockCommentService = {
    createComment: jest.fn(),
    getCommentsByTask: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
};

jest.unstable_mockModule('../src/modules/comments/comment.service.js', () => mockCommentService);

// Mock auth middleware
jest.unstable_mockModule('../src/modules/auth/auth.middleware.js', () => ({
    authMiddleware: (req, _res, next) => {
        req.user = {
            userId: 'test-user-123',
            role: 'MEMBER'
        };
        next();
    },
}));

// Import routes after mocking
const { default: commentRoutes } = await import('../src/modules/comments/comment.routes.js');

// Create test app
const app = express();
app.use(express.json());
app.use('/', commentRoutes);

describe('Comment Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /tasks/:taskId/comments', () => {
        const taskId = 'task-123';

        it('should create a comment and return 201', async () => {
            const commentData = {
                content: 'This is a test comment',
            };

            const mockResponse = {
                id: 'comment-123',
                taskId,
                content: commentData.content,
                createdBy: 'test-user-123',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockCommentService.createComment.mockResolvedValueOnce(mockResponse);

            const response = await request(app)
                .post(`/tasks/${taskId}/comments`)
                .send(commentData);

            expect(response.status).toBe(201);
            expect(response.body.content).toBe(commentData.content);
            expect(response.body.taskId).toBe(taskId);
            expect(mockCommentService.createComment).toHaveBeenCalledWith(
                taskId,
                commentData.content,
                'test-user-123'
            );
        });

        it('should return 400 if content is empty', async () => {
            const response = await request(app)
                .post(`/tasks/${taskId}/comments`)
                .send({ content: '' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details).toBeDefined();
        });

        it('should return 400 if content is missing', async () => {
            const response = await request(app)
                .post(`/tasks/${taskId}/comments`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details).toBeDefined();
        });

        it('should return 500 on database error', async () => {
            mockCommentService.createComment.mockRejectedValueOnce(
                new Error('Database connection failed')
            );

            const response = await request(app)
                .post(`/tasks/${taskId}/comments`)
                .send({ content: 'Test comment' });

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Database connection failed');
        });
    });

    describe('GET /tasks/:taskId/comments', () => {
        const taskId = 'task-123';

        it('should return all comments for a task', async () => {
            const mockComments = [
                {
                    id: 'comment-1',
                    taskId,
                    content: 'First comment',
                    createdBy: 'user-1',
                    createdAt: new Date('2025-01-01'),
                    updatedAt: new Date('2025-01-01'),
                },
                {
                    id: 'comment-2',
                    taskId,
                    content: 'Second comment',
                    createdBy: 'user-2',
                    createdAt: new Date('2025-01-02'),
                    updatedAt: new Date('2025-01-02'),
                },
            ];

            mockCommentService.getCommentsByTask.mockResolvedValueOnce(mockComments);

            const response = await request(app)
                .get(`/tasks/${taskId}/comments`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].content).toBe('First comment');
            expect(response.body[1].content).toBe('Second comment');
            expect(mockCommentService.getCommentsByTask).toHaveBeenCalledWith(taskId);
        });

        it('should return empty array if no comments exist', async () => {
            mockCommentService.getCommentsByTask.mockResolvedValueOnce([]);

            const response = await request(app)
                .get(`/tasks/${taskId}/comments`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('should return 500 on database error', async () => {
            mockCommentService.getCommentsByTask.mockRejectedValueOnce(
                new Error('Database error')
            );

            const response = await request(app)
                .get(`/tasks/${taskId}/comments`);

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Database error');
        });
    });

    describe('PUT /comments/:commentId', () => {
        const commentId = 'comment-123';

        it('should update a comment successfully', async () => {
            const updateData = {
                content: 'Updated comment text',
            };

            const mockResponse = {
                id: commentId,
                taskId: 'task-123',
                content: updateData.content,
                createdBy: 'test-user-123',
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date(),
            };

            mockCommentService.updateComment.mockResolvedValueOnce(mockResponse);

            const response = await request(app)
                .put(`/comments/${commentId}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.content).toBe(updateData.content);
            expect(mockCommentService.updateComment).toHaveBeenCalledWith(
                commentId,
                updateData.content,
                'test-user-123'
            );
        });

        it('should return 400 if content is empty', async () => {
            const response = await request(app)
                .put(`/comments/${commentId}`)
                .send({ content: '' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details).toBeDefined();
        });

        it('should return 403 if user is not the owner', async () => {
            mockCommentService.updateComment.mockRejectedValueOnce(
                new Error('Unauthorized: You can only update your own comments')
            );

            const response = await request(app)
                .put(`/comments/${commentId}`)
                .send({ content: 'Updated text' });

            expect(response.status).toBe(403);
            expect(response.body.error).toContain('Unauthorized');
        });

        it('should return 404 if comment not found', async () => {
            mockCommentService.updateComment.mockRejectedValueOnce(
                new Error('Comment not found')
            );

            const response = await request(app)
                .put(`/comments/${commentId}`)
                .send({ content: 'Updated text' });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Comment not found');
        });
    });

    describe('DELETE /comments/:commentId', () => {
        const commentId = 'comment-123';

        it('should delete a comment successfully', async () => {
            const mockResponse = {
                message: 'Comment deleted successfully',
            };

            mockCommentService.deleteComment.mockResolvedValueOnce(mockResponse);

            const response = await request(app)
                .delete(`/comments/${commentId}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Comment deleted successfully');
            expect(mockCommentService.deleteComment).toHaveBeenCalledWith(
                commentId,
                'test-user-123',
                'MEMBER'
            );
        });

        it('should return 403 if user lacks permission', async () => {
            mockCommentService.deleteComment.mockRejectedValueOnce(
                new Error('Unauthorized to delete this comment')
            );

            const response = await request(app)
                .delete(`/comments/${commentId}`);

            expect(response.status).toBe(403);
            expect(response.body.error).toContain('Unauthorized');
        });

        it('should return 404 if comment not found', async () => {
            mockCommentService.deleteComment.mockRejectedValueOnce(
                new Error('Comment not found')
            );

            const response = await request(app)
                .delete(`/comments/${commentId}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Comment not found');
        });

        it('should return 500 on database error', async () => {
            mockCommentService.deleteComment.mockRejectedValueOnce(
                new Error('Database error')
            );

            const response = await request(app)
                .delete(`/comments/${commentId}`);

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Database error');
        });
    });
});
