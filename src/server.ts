import http from 'http';
import app from '@/app.js';
import logger from '@utils/logger.js';
import { env } from '@config/env.js';

const port = normalizePort(env.PORT);
app.set('port', port);

const server = http.createServer(app);

server.listen(port);

server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    switch (error.code) {
        case 'EACCES':
            logger.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});

server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
    logger.info(`Server listening on ${bind} (${env.NODE_ENV} mode)`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

function normalizePort(val: number): number | string {
    const port = typeof val === 'number' ? val : parseInt(String(val), 10);

    if (isNaN(port)) {
        return String(val);
    }

    if (port >= 0) {
        return port;
    }

    return false;
}
