import * as AuthService from './auth.service.js';

/**
 * Handle user registration
 */
export async function register(req, res) {
    try {
        const result = await AuthService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Handle user login
 */
export async function login(req, res) {
    try {
        const tokens = await AuthService.login(req.body);
        res.status(200).json(tokens);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
}

/**
 * Handle token refresh
 */
export async function refresh(req, res) {
    try {
        const { refreshToken } = req.body;
        const newTokens = await AuthService.refreshAccessToken(refreshToken);
        res.status(200).json(newTokens);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
}