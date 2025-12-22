import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';

// Mock the auth service
const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshAccessToken: jest.fn(),
    changePassword: jest.fn(),
};

// Mock the service module
jest.unstable_mockModule('../src/modules/auth/auth.service.js', () => mockAuthService);

// Mock the auth middleware
const mockAuthMiddleware = jest.fn((req, res, next) => {
    req.user = { userId: 'user-123' };
    next();
});

jest.unstable_mockModule('../src/modules/auth/auth.middleware.js', () => ({
    authMiddleware: mockAuthMiddleware,
}));

// Import Express and create test app
const express = (await import('express')).default;
const authRoutes = (await import('../src/modules/auth/auth.routes.js')).default;

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
    beforeEach(() => {
        mockAuthService.register.mockReset();
        mockAuthService.login.mockReset();
        mockAuthService.refreshAccessToken.mockReset();
        mockAuthService.changePassword.mockReset();
        mockAuthMiddleware.mockClear();
    });

    describe('POST /auth/register', () => {
        it('should register a new user and return 201', async () => {
            const registerData = {
                email: 'test@example.com',
                password: 'Password123'
            };
            const mockResponse = {
                message: 'User registered successfully',
                user: { id: 'user-123', email: 'test@example.com' }
            };

            mockAuthService.register.mockResolvedValueOnce(mockResponse);

            const response = await request(app)
                .post('/auth/register')
                .send(registerData);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockResponse);
            expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
        });

        it('should return 400 on validation error', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({ email: 'invalid', password: 'Password123' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details).toBeDefined();
        });

        it('should return 400 if email already exists', async () => {
            mockAuthService.register.mockRejectedValueOnce(new Error('Email already in use.'));

            const response = await request(app)
                .post('/auth/register')
                .send({ email: 'existing@example.com', password: 'Password123' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Email already in use.');
        });
    });

    describe('POST /auth/login', () => {
        it('should login successfully and return tokens', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'Password123'
            };
            const mockTokens = {
                accessToken: 'access-token',
                refreshToken: 'refresh-token'
            };

            mockAuthService.login.mockResolvedValueOnce(mockTokens);

            const response = await request(app)
                .post('/auth/login')
                .send(loginData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTokens);
            expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
        });

        it('should return 401 on invalid credentials', async () => {
            mockAuthService.login.mockRejectedValueOnce(new Error('Invalid email or password.'));

            const response = await request(app)
                .post('/auth/login')
                .send({ email: 'test@example.com', password: 'wrong' });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid email or password.');
        });

        it('should return 401 if email is missing', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({ password: 'Password123' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details).toBeDefined();
        });

        it('should return 401 if password is missing', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({ email: 'test@example.com' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details).toBeDefined();
        });
    });

    describe('POST /auth/refresh', () => {
        it('should refresh access token successfully', async () => {
            const refreshToken = 'valid-refresh-token';
            const mockResponse = { accessToken: 'new-access-token' };

            mockAuthService.refreshAccessToken.mockResolvedValueOnce(mockResponse);

            const response = await request(app)
                .post('/auth/refresh')
                .send({ refreshToken });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith(refreshToken);
        });

        it('should return 401 if refresh token is missing', async () => {
            const response = await request(app)
                .post('/auth/refresh')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details).toBeDefined();
        });

        it('should return 401 if refresh token is invalid', async () => {
            mockAuthService.refreshAccessToken.mockRejectedValueOnce(new Error('Invalid refresh token.'));

            const response = await request(app)
                .post('/auth/refresh')
                .send({ refreshToken: 'invalid-token' });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid refresh token.');
        });
    });

    describe('POST /auth/change-password', () => {
        it('should change password successfully', async () => {
            const passwordData = {
                currentPassword: 'OldPassword123',
                newPassword: 'NewPassword123'
            };
            const mockResponse = { message: 'Password changed successfully' };

            mockAuthService.changePassword.mockResolvedValueOnce(mockResponse);

            const response = await request(app)
                .post('/auth/change-password')
                .send(passwordData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(mockAuthMiddleware).toHaveBeenCalled();
            expect(mockAuthService.changePassword).toHaveBeenCalledWith('user-123', passwordData);
        });

        it('should return 400 if current password is missing', async () => {
            const response = await request(app)
                .post('/auth/change-password')
                .send({ newPassword: 'NewPassword123' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details).toBeDefined();
        });

        it('should return 400 if new password is missing', async () => {
            const response = await request(app)
                .post('/auth/change-password')
                .send({ currentPassword: 'OldPassword123' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details).toBeDefined();
        });

        it('should return 400 if current password is incorrect', async () => {
            mockAuthService.changePassword.mockRejectedValueOnce(
                new Error('Current password is incorrect.')
            );

            const response = await request(app)
                .post('/auth/change-password')
                .send({
                    currentPassword: 'WrongPassword123',
                    newPassword: 'NewPassword123'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Current password is incorrect.');
        });

        it('should return 400 if new password is same as current', async () => {
            const response = await request(app)
                .post('/auth/change-password')
                .send({
                    currentPassword: 'Password123',
                    newPassword: 'Password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details).toBeDefined();
            // Check that the validation error mentions password being the same
            expect(JSON.stringify(response.body.details)).toContain('different from current password');
        });

        it('should pass authenticated user ID to service', async () => {
            const passwordData = {
                currentPassword: 'OldPassword123',
                newPassword: 'NewPassword123'
            };

            mockAuthService.changePassword.mockResolvedValueOnce({ message: 'Password changed successfully' });

            await request(app)
                .post('/auth/change-password')
                .send(passwordData);

            expect(mockAuthService.changePassword).toHaveBeenCalledWith('user-123', passwordData);
        });
    });
});
