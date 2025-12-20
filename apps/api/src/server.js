import dotenv from "dotenv";
import app from "./app.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Log startup information
console.log('[Server] Starting server...');
console.log('[Server] Environment:', process.env.NODE_ENV || 'development');
console.log('[Server] Port:', PORT);
console.log('[Server] Host:', HOST);
console.log('[Server] Database URL configured:', !!process.env.DATABASE_URL);

const server = app.listen(PORT, HOST, () => {
    console.log(`[Server] ✓ Server running on ${HOST}:${PORT}`);
    console.log(`[Server] ✓ Health check available at http://${HOST}:${PORT}/health`);
});

// Handle server errors
server.on('error', (error) => {
    console.error('[Server] ✗ Server error:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received, closing server...');
    server.close(() => {
        console.log('[Server] Server closed');
        process.exit(0);
    });
});