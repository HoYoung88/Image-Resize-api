import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import imageRoutes from '@routes/imageRoutes.js';
import logger from '@utils/logger.js';

if (process.env.NODE_ENV === 'production') {
    process.env.LOGGING_FILE_PATH = './logs';
    process.env.CDN_DOMAIN = 'CDN_DOMAIN';
} else {
    process.env.CDN_DOMAIN = 'CDN_DOMAIN';
}

const app = express();
app.use(
    morgan('dev', {
        stream: {
            write(str: string) {
                logger.info(str);
            },
        },
    }),
);

app.get('/', (req, res, next) => {
    const healthCheck = {
        uptime: process.uptime(),
        message: 'OK',
    };
    res.status(200).json(healthCheck);
});
app.use(imageRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.status) {
        res.status(err.status).json({ message: err.message });
    } else {
        res.status(500).json({ message: err.message });
    }
});

export default app;
