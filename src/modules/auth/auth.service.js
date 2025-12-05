import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../database/prisma.js';
import { validateEmail, validatePassword } from '../../shared/utils/validation.js';

/**
 * Register a new user
 */
export async function register(data){
    const { email, password } = data;

    // Validate email and password
    if (!validateEmail(email)) {
        throw new Error('Invalid email format.');
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
    }

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('Email already in use.');
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { email, password: hashedPassword }
    });

    return { message: 'User registered successfully', user: { id: user.id, email: user.email } };
}

/**
 * Login user and return JWT tokens
 */
export async function login(data) {
    const { email, password } = data;

    if (!email || !password) {
        throw new Error('Email and password are required.');
    }

    // Find user and verify password
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Invalid email or password.');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new Error('Invalid email or password.');
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken) {
    if (!refreshToken) {
        throw new Error('Refresh token is required.');
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Verify user still exists
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            throw new Error('User not found.');
        }

        // Generate new access token
        const newAccessToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        return { accessToken: newAccessToken };
    } catch (error) {
        throw new Error('Invalid refresh token.');
    }
}