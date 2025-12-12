import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '@utils/errors.js';
import { env } from '@config/env.js';

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

const cleanupInterval = setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, 60000); // 1분마다 정리

// 프로세스 종료 시 정리
process.on('SIGTERM', () => clearInterval(cleanupInterval));
process.on('SIGINT', () => clearInterval(cleanupInterval));

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = env.RATE_LIMIT_WINDOW_MS;
    const maxRequests = env.RATE_LIMIT_MAX_REQUESTS;

    if (!store[clientId] || store[clientId].resetTime < now) {
        store[clientId] = {
            count: 1,
            resetTime: now + windowMs,
        };
        return next();
    }

    if (store[clientId].count >= maxRequests) {
        res.setHeader('Retry-After', Math.ceil((store[clientId].resetTime - now) / 1000));
        return next(new ValidationError(`Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs}ms`));
    }

    store[clientId].count++;
    next();
};

