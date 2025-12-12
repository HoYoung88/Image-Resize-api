import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import imageRoutes from '@routes/imageRoutes.js';
import logger from '@utils/logger.js';
import { AppError } from '@utils/errors.js';
import { env } from '@config/env.js';
import { rateLimiter } from '@middlewares/rateLimiter.js';

const app = express();

// Trust proxy (for rate limiting IP detection)
app.set('trust proxy', 1);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Rate limiting
app.use(rateLimiter);

// Logging middleware
app.use(
    morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
        stream: {
            write(str: string) {
                logger.info(str.trim());
            },
        },
    }),
);

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
    const healthCheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
    };
    res.status(200).json(healthCheck);
});

// API routes
app.use(imageRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        logger.error(`[${err.status}] ${err.message}`, { path: req.path, method: req.method });
        return res.status(err.status).json({
            message: err.message,
            ...(env.NODE_ENV === 'development' && { stack: err.stack }),
        });
    }

    // Unexpected errors
    logger.error('Unexpected error:', err);
    res.status(500).json({
        message: 'Internal server error',
        ...(env.NODE_ENV === 'development' && { error: err.message, stack: err.stack }),
    });
});

export default app;
