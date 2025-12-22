import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock Prisma at the module level
const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
};

// Mock bcrypt
jest.unstable_mockModule('bcryptjs', () => ({
    default: {
        hash: jest.fn(),
        compare: jest.fn(),
    },
}));

// Mock jwt
jest.unstable_mockModule('jsonwebtoken', () => ({
    default: {
        sign: jest.fn(),
        verify: jest.fn(),
    },
}));

// Mock the prisma module
jest.unstable_mockModule('../src/database/prisma.js', () => ({
    default: mockPrisma,
}));

// Import mocked modules
const bcryptMock = (await import('bcryptjs')).default;
const jwtMock = (await import('jsonwebtoken')).default;

// Now import the service after mocking
const { register, login, refreshAccessToken, changePassword } = await import('../src/modules/auth/auth.service.js');

describe('Auth Service', () => {
    beforeEach(() => {
        // Reset all mocks
        mockPrisma.user.findUnique.mockReset();
        mockPrisma.user.create.mockReset();
        mockPrisma.user.update.mockReset();
        bcryptMock.hash.mockReset();
        bcryptMock.compare.mockReset();
        jwtMock.sign.mockReset();
        jwtMock.verify.mockReset();

        // Set JWT secrets for testing
        process.env.JWT_SECRET = 'test-secret';
        process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    });

    describe('register', () => {
        const validEmail = 'test@example.com';
        const validPassword = 'Password123';

        it('should register a new user successfully', async () => {
            const hashedPassword = 'hashed-password';
            const newUser = { id: 'user-123', email: validEmail, name: null };

            mockPrisma.user.findUnique.mockResolvedValueOnce(null);
            bcryptMock.hash.mockResolvedValueOnce(hashedPassword);
            mockPrisma.user.create.mockResolvedValueOnce({ ...newUser, password: hashedPassword });

            const result = await register({ email: validEmail, password: validPassword });

            expect(result.message).toBe('User registered successfully');
            expect(result.user).toEqual({ id: 'user-123', email: validEmail, name: null });
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: validEmail } });
            expect(bcryptMock.hash).toHaveBeenCalledWith(validPassword, 10);
            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: validEmail,
                    password: hashedPassword,
                    name: null
                }
            });
        });

        it('should throw error for invalid email format', async () => {
            await expect(
                register({ email: 'invalid-email', password: validPassword })
            ).rejects.toThrow('Invalid email format.');
        });

        it('should throw error for weak password (no uppercase)', async () => {
            await expect(
                register({ email: validEmail, password: 'password123' })
            ).rejects.toThrow();
        });

        it('should throw error for weak password (no number)', async () => {
            await expect(
                register({ email: validEmail, password: 'Password' })
            ).rejects.toThrow();
        });

        it('should throw error for short password', async () => {
            await expect(
                register({ email: validEmail, password: 'Pass1' })
            ).rejects.toThrow();
        });

        it('should throw error if email already exists', async () => {
            mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-user', email: validEmail });

            await expect(
                register({ email: validEmail, password: validPassword })
            ).rejects.toThrow('Email already in use.');
        });

        it('should throw error if database create fails', async () => {
            mockPrisma.user.findUnique.mockResolvedValueOnce(null);
            bcryptMock.hash.mockResolvedValueOnce('hashed-password');
            mockPrisma.user.create.mockRejectedValueOnce(new Error('Database error'));

            await expect(
                register({ email: validEmail, password: validPassword })
            ).rejects.toThrow('Database error');
        });
    });

    describe('login', () => {
        const email = 'test@example.com';
        const password = 'Password123';
        const userId = 'user-123';
        const hashedPassword = 'hashed-password';

        it('should login successfully and return tokens', async () => {
            const user = { id: userId, email, password: hashedPassword };
            const accessToken = 'access-token';
            const refreshToken = 'refresh-token';

            mockPrisma.user.findUnique.mockResolvedValueOnce(user);
            bcryptMock.compare.mockResolvedValueOnce(true);
            jwtMock.sign
                .mockReturnValueOnce(accessToken)
                .mockReturnValueOnce(refreshToken);

            const result = await login({ email, password });

            expect(result.accessToken).toBe(accessToken);
            expect(result.refreshToken).toBe(refreshToken);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
            expect(bcryptMock.compare).toHaveBeenCalledWith(password, hashedPassword);
            expect(jwtMock.sign).toHaveBeenCalledTimes(2);
        });

        it('should throw error if email is missing', async () => {
            await expect(
                login({ password })
            ).rejects.toThrow('Email and password are required.');
        });

        it('should throw error if password is missing', async () => {
            await expect(
                login({ email })
            ).rejects.toThrow('Email and password are required.');
        });

        it('should throw error if user not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValueOnce(null);

            await expect(
                login({ email, password })
            ).rejects.toThrow('Invalid email or password.');
        });

        it('should throw error if password is incorrect', async () => {
            const user = { id: userId, email, password: hashedPassword };

            mockPrisma.user.findUnique.mockResolvedValueOnce(user);
            bcryptMock.compare.mockResolvedValueOnce(false);

            await expect(
                login({ email, password })
            ).rejects.toThrow('Invalid email or password.');
        });
    });

    describe('refreshAccessToken', () => {
        const userId = 'user-123';
        const refreshToken = 'valid-refresh-token';

        it('should refresh access token successfully', async () => {
            const user = { id: userId, email: 'test@example.com' };
            const newAccessToken = 'new-access-token';

            jwtMock.verify.mockReturnValueOnce({ userId });
            mockPrisma.user.findUnique.mockResolvedValueOnce(user);
            jwtMock.sign.mockReturnValueOnce(newAccessToken);

            const result = await refreshAccessToken(refreshToken);

            expect(result.accessToken).toBe(newAccessToken);
            expect(jwtMock.verify).toHaveBeenCalledWith(refreshToken, process.env.JWT_REFRESH_SECRET);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
        });

        it('should throw error if refresh token is missing', async () => {
            await expect(
                refreshAccessToken(null)
            ).rejects.toThrow('Refresh token is required.');
        });

        it('should throw error if refresh token is invalid', async () => {
            jwtMock.verify.mockImplementationOnce(() => {
                throw new Error('Invalid token');
            });

            await expect(
                refreshAccessToken('invalid-token')
            ).rejects.toThrow('Invalid refresh token.');
        });

        it('should throw error if user not found', async () => {
            jwtMock.verify.mockReturnValueOnce({ userId });
            mockPrisma.user.findUnique.mockResolvedValueOnce(null);

            await expect(
                refreshAccessToken(refreshToken)
            ).rejects.toThrow('Invalid refresh token.');
        });
    });

    describe('changePassword', () => {
        const userId = 'user-123';
        const currentPassword = 'OldPassword123';
        const newPassword = 'NewPassword123';
        const hashedOldPassword = 'hashed-old-password';
        const hashedNewPassword = 'hashed-new-password';

        it('should change password successfully', async () => {
            const user = { id: userId, email: 'test@example.com', password: hashedOldPassword };

            mockPrisma.user.findUnique.mockResolvedValueOnce(user);
            bcryptMock.compare
                .mockResolvedValueOnce(true)  // current password check
                .mockResolvedValueOnce(false); // new password != current password check
            bcryptMock.hash.mockResolvedValueOnce(hashedNewPassword);
            mockPrisma.user.update.mockResolvedValueOnce(user);

            const result = await changePassword(userId, { currentPassword, newPassword });

            expect(result.message).toBe('Password changed successfully');
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
            expect(bcryptMock.compare).toHaveBeenCalledWith(currentPassword, hashedOldPassword);
            expect(bcryptMock.hash).toHaveBeenCalledWith(newPassword, 10);
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { password: hashedNewPassword }
            });
        });

        it('should throw error if current password is missing', async () => {
            await expect(
                changePassword(userId, { newPassword })
            ).rejects.toThrow('Current password and new password are required.');
        });

        it('should throw error if new password is missing', async () => {
            await expect(
                changePassword(userId, { currentPassword })
            ).rejects.toThrow('Current password and new password are required.');
        });

        it('should throw error if new password is invalid', async () => {
            await expect(
                changePassword(userId, { currentPassword, newPassword: 'weak' })
            ).rejects.toThrow();
        });

        it('should throw error if user not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValueOnce(null);

            await expect(
                changePassword(userId, { currentPassword, newPassword })
            ).rejects.toThrow('User not found.');
        });

        it('should throw error if current password is incorrect', async () => {
            const user = { id: userId, email: 'test@example.com', password: hashedOldPassword };

            mockPrisma.user.findUnique.mockResolvedValueOnce(user);
            bcryptMock.compare.mockResolvedValueOnce(false);

            await expect(
                changePassword(userId, { currentPassword, newPassword })
            ).rejects.toThrow('Current password is incorrect.');
        });

        it('should throw error if new password is same as current password', async () => {
            const user = { id: userId, email: 'test@example.com', password: hashedOldPassword };

            mockPrisma.user.findUnique.mockResolvedValueOnce(user);
            bcryptMock.compare
                .mockResolvedValueOnce(true)  // current password check passes
                .mockResolvedValueOnce(true); // new password == current password

            await expect(
                changePassword(userId, { currentPassword, newPassword })
            ).rejects.toThrow('New password must be different from current password.');
        });
    });
});
