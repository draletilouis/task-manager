import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate JWT tokens
 * Verifies token from Authorization header and attaches user to request
 */
export function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;

    if (!auth) {
        return res.status(401).json({ error: 'No token provided.' });
    }

    // Extract token from "Bearer <token>" format
    const token = auth.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Malformed token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: decoded.userId };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}