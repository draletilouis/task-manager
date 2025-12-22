import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock Prisma before importing the service
jest.unstable_mockModule('../src/database/prisma.js', () => ({
    default: {
        user: {
            findUnique: jest.fn(),
            update: jest.fn()
        }
    }
}));

// Import after mocking
const { default: mockPrisma } = await import('../src/database/prisma.js');
const { requestPasswordReset, resetPassword } = await import('../src/modules/auth/auth.service.js');

describe('Password Reset Service', () => {
    const testUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: '$2a$10$someHashedPassword',
        name: 'Test User',
        resetToken: null,
        resetTokenExpiry: null
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockPrisma.user.findUnique.mockReset();
        mockPrisma.user.update.mockReset();
        process.env.JWT_SECRET = 'test-secret';
        process.env.FRONTEND_URL = 'http://localhost:5173';
    });

    describe('requestPasswordReset', () => {
        it('should generate reset token for existing user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(testUser);
            mockPrisma.user.update.mockResolvedValue({
                ...testUser,
                resetToken: 'some-token',
                resetTokenExpiry: new Date(Date.now() + 3600000)
            });

            const result = await requestPasswordReset('test@example.com');

            expect(result.message).toContain('password reset link has been sent');
            // Token is not returned for security (prevent email enumeration)
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' }
            });
            expect(mockPrisma.user.update).toHaveBeenCalled();
        });

        it('should return same message for non-existing user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const result = await requestPasswordReset('nonexistent@example.com');

            expect(result.message).toContain('password reset link has been sent');
            // Should not reveal whether user exists
            expect(mockPrisma.user.update).not.toHaveBeenCalled();
        });

        it('should normalize email to lowercase and trim', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(testUser);
            mockPrisma.user.update.mockResolvedValue(testUser);

            await requestPasswordReset('  TEST@EXAMPLE.COM  ');

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' }
            });
        });

        it('should throw error if email is not provided', async () => {
            await expect(requestPasswordReset('')).rejects.toThrow('Email is required');
            await expect(requestPasswordReset(null)).rejects.toThrow('Email is required');
        });

        it('should store token in database with JWT format', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(testUser);

            let capturedToken;
            mockPrisma.user.update.mockImplementation((args) => {
                capturedToken = args.data.resetToken;
                return Promise.resolve(testUser);
            });

            await requestPasswordReset('test@example.com');

            // Verify token was stored and is a valid JWT format
            expect(capturedToken).toBeDefined();
            expect(typeof capturedToken).toBe('string');
            const decoded = jwt.decode(capturedToken);
            expect(decoded.userId).toBe(testUser.id);
            expect(decoded.email).toBe(testUser.email);
        });

        it('should sign token with JWT_SECRET + user password for auto-invalidation', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(testUser);

            let capturedToken;
            mockPrisma.user.update.mockImplementation((args) => {
                capturedToken = args.data.resetToken;
                return Promise.resolve(testUser);
            });

            await requestPasswordReset('test@example.com');

            // Token should be verifiable with combined secret
            expect(() => {
                jwt.verify(capturedToken, process.env.JWT_SECRET + testUser.password);
            }).not.toThrow();

            // Token should NOT be verifiable with just JWT_SECRET
            expect(() => {
                jwt.verify(capturedToken, process.env.JWT_SECRET);
            }).toThrow();
        });

        it('should set token expiry to 1 hour from now', async () => {
            const beforeTime = Date.now() + 3600000;
            mockPrisma.user.findUnique.mockResolvedValue(testUser);

            let capturedExpiry;
            mockPrisma.user.update.mockImplementation((args) => {
                capturedExpiry = args.data.resetTokenExpiry;
                return Promise.resolve(testUser);
            });

            await requestPasswordReset('test@example.com');

            const afterTime = Date.now() + 3600000;
            const expiryTime = capturedExpiry.getTime();

            expect(expiryTime).toBeGreaterThanOrEqual(beforeTime - 1000);
            expect(expiryTime).toBeLessThanOrEqual(afterTime + 1000);
        });

        it('should store token and expiry in database', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(testUser);
            mockPrisma.user.update.mockResolvedValue(testUser);

            await requestPasswordReset('test@example.com');

            expect(mockPrisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: testUser.id },
                    data: expect.objectContaining({
                        resetToken: expect.any(String),
                        resetTokenExpiry: expect.any(Date)
                    })
                })
            );
        });
    });

    describe('resetPassword', () => {
        let validToken;
        let validUser;

        beforeEach(() => {
            validUser = {
                ...testUser,
                resetTokenExpiry: new Date(Date.now() + 3600000)
            };
            validToken = jwt.sign(
                { userId: validUser.id, email: validUser.email },
                process.env.JWT_SECRET + validUser.password,
                { expiresIn: '1h' }
            );
            validUser.resetToken = validToken;
        });

        it('should successfully reset password with valid token', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(validUser);
            mockPrisma.user.update.mockResolvedValue(validUser);

            const result = await resetPassword(validToken, 'NewPassword123');

            expect(result.message).toContain('successfully');
            expect(mockPrisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: validUser.id },
                    data: expect.objectContaining({
                        password: expect.any(String),
                        resetToken: null,
                        resetTokenExpiry: null
                    })
                })
            );
        });

        it('should throw error for invalid token', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                resetPassword('invalid-token', 'NewPassword123')
            ).rejects.toThrow('Invalid or expired reset token');
        });

        it('should throw error for expired token', async () => {
            const expiredUser = {
                ...validUser,
                resetTokenExpiry: new Date(Date.now() - 1000) // Expired 1 second ago
            };
            mockPrisma.user.findUnique.mockResolvedValue(expiredUser);
            mockPrisma.user.update.mockResolvedValue(expiredUser);

            await expect(
                resetPassword(validToken, 'NewPassword123')
            ).rejects.toThrow('expired');

            // Should clean up expired token
            expect(mockPrisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: expiredUser.id },
                    data: { resetToken: null, resetTokenExpiry: null }
                })
            );
        });

        it('should throw error if token verification fails', async () => {
            // Create token with different password
            const wrongToken = jwt.sign(
                { userId: validUser.id, email: validUser.email },
                process.env.JWT_SECRET + 'different-password',
                { expiresIn: '1h' }
            );

            const userWithWrongToken = { ...validUser, resetToken: wrongToken };
            mockPrisma.user.findUnique.mockResolvedValue(userWithWrongToken);

            await expect(
                resetPassword(wrongToken, 'NewPassword123')
            ).rejects.toThrow('Invalid reset token');
        });

        it('should validate password requirements', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(validUser);

            // Too short
            await expect(
                resetPassword(validToken, 'Short1')
            ).rejects.toThrow('at least 8 characters');

            // No uppercase
            await expect(
                resetPassword(validToken, 'lowercase123')
            ).rejects.toThrow('uppercase');

            // No lowercase
            await expect(
                resetPassword(validToken, 'UPPERCASE123')
            ).rejects.toThrow('lowercase');

            // No number
            await expect(
                resetPassword(validToken, 'NoNumbers')
            ).rejects.toThrow('digit');
        });

        it('should require token parameter', async () => {
            await expect(
                resetPassword('', 'NewPassword123')
            ).rejects.toThrow('Reset token and new password are required');

            await expect(
                resetPassword(null, 'NewPassword123')
            ).rejects.toThrow('Reset token and new password are required');
        });

        it('should require newPassword parameter', async () => {
            await expect(
                resetPassword(validToken, '')
            ).rejects.toThrow('Reset token and new password are required');

            await expect(
                resetPassword(validToken, null)
            ).rejects.toThrow('Reset token and new password are required');
        });

        it('should reject if new password matches current password', async () => {
            // Create a mock where bcrypt.compare will return true
            const userWithKnownPassword = {
                ...validUser,
                password: await bcrypt.hash('SamePassword123', 10)
            };

            const tokenForKnownPassword = jwt.sign(
                { userId: userWithKnownPassword.id, email: userWithKnownPassword.email },
                process.env.JWT_SECRET + userWithKnownPassword.password,
                { expiresIn: '1h' }
            );
            userWithKnownPassword.resetToken = tokenForKnownPassword;

            mockPrisma.user.findUnique.mockResolvedValue(userWithKnownPassword);

            await expect(
                resetPassword(tokenForKnownPassword, 'SamePassword123')
            ).rejects.toThrow('different from your current password');
        });

        it('should hash new password before saving', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(validUser);

            let capturedPassword;
            mockPrisma.user.update.mockImplementation((args) => {
                capturedPassword = args.data.password;
                return Promise.resolve(validUser);
            });

            await resetPassword(validToken, 'NewPassword123');

            // Verify password was hashed
            expect(capturedPassword).toMatch(/^\$2[ab]\$/);
            expect(capturedPassword).not.toBe('NewPassword123');

            // Verify hashed password can be verified
            const isValid = await bcrypt.compare('NewPassword123', capturedPassword);
            expect(isValid).toBe(true);
        });

        it('should clear reset token after successful reset', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(validUser);
            mockPrisma.user.update.mockResolvedValue(validUser);

            await resetPassword(validToken, 'NewPassword123');

            expect(mockPrisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        resetToken: null,
                        resetTokenExpiry: null
                    })
                })
            );
        });

        it('should invalidate token when password changes (security feature)', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(validUser);

            const newHashedPassword = await bcrypt.hash('NewPassword123', 10);
            mockPrisma.user.update.mockResolvedValue({
                ...validUser,
                password: newHashedPassword
            });

            await resetPassword(validToken, 'NewPassword123');

            // After password change, old token should be invalid
            // because JWT was signed with old password
            const userAfterReset = {
                ...validUser,
                password: newHashedPassword
            };

            // Verify old token can't be verified with new password
            expect(() => {
                jwt.verify(validToken, process.env.JWT_SECRET + userAfterReset.password);
            }).toThrow();
        });
    });

    describe('Security Tests', () => {
        it('should prevent email enumeration by returning same message', async () => {
            // For existing user
            mockPrisma.user.findUnique.mockResolvedValueOnce(testUser);
            mockPrisma.user.update.mockResolvedValue(testUser);
            const result1 = await requestPasswordReset('test@example.com');

            // For non-existing user
            mockPrisma.user.findUnique.mockResolvedValueOnce(null);
            const result2 = await requestPasswordReset('nonexistent@example.com');

            expect(result1.message).toBe(result2.message);
        });

        it('should use user password in JWT signing for auto-invalidation', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(testUser);

            let capturedToken;
            mockPrisma.user.update.mockImplementation((args) => {
                capturedToken = args.data.resetToken;
                return Promise.resolve(testUser);
            });

            await requestPasswordReset('test@example.com');

            // Should verify with correct combined secret
            expect(() => {
                jwt.verify(capturedToken, process.env.JWT_SECRET + testUser.password);
            }).not.toThrow();

            // Should fail with different password (simulating password change)
            expect(() => {
                jwt.verify(capturedToken, process.env.JWT_SECRET + 'different-password');
            }).toThrow();
        });

        it('should enforce password complexity requirements', async () => {
            const validUser = {
                ...testUser,
                resetToken: 'valid-token',
                resetTokenExpiry: new Date(Date.now() + 3600000)
            };

            const token = jwt.sign(
                { userId: validUser.id, email: validUser.email },
                process.env.JWT_SECRET + validUser.password,
                { expiresIn: '1h' }
            );
            validUser.resetToken = token;

            mockPrisma.user.findUnique.mockResolvedValue(validUser);

            // All these should fail validation
            await expect(resetPassword(token, 'short')).rejects.toThrow();
            await expect(resetPassword(token, 'nouppercase1')).rejects.toThrow();
            await expect(resetPassword(token, 'NOLOWERCASE1')).rejects.toThrow();
            await expect(resetPassword(token, 'NoNumbers')).rejects.toThrow();
        });
    });
});
