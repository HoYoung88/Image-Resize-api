import { createLogger, transports, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as util from 'node:util';
import { env } from '@config/env.js';
import * as fs from 'fs';
import * as path from 'path';

const { combine, timestamp, printf, colorize, errors } = format;

// 로그 디렉토리 생성
const logDir = env.LOGGING_FILE_PATH;
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logPattern = printf((info) => {
    const { level, message, timestamp, ...meta } = info;
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level.toUpperCase()}] ${message}${metaString}`;
});

const consoleAppender = () =>
    new transports.Console({
        format: combine(
            timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            errors({ stack: true }),
            logPattern,
            colorize({ all: true }),
        ),
    });

const fileAppender = (level: string) =>
    new DailyRotateFile({
        filename: path.join(logDir, `${level}-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level,
        format: combine(
            timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            errors({ stack: true }),
            logPattern,
        ),
    });

const logger = createLogger({
    defaultMeta: { service: 'image-resize-api' },
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
});

if (env.NODE_ENV !== 'production') {
    logger.add(consoleAppender());
} else {
    logger.add(fileAppender('info'));
    logger.add(fileAppender('error'));
    logger.add(fileAppender('warn'));
}

export default {
    info: (...args: any[]) => logger.info(util.format(...args)),
    debug: (...args: any[]) => logger.debug(util.format(...args)),
    error: (...args: any[]) => logger.error(util.format(...args)),
    warn: (...args: any[]) => logger.warn(util.format(...args)),
};
