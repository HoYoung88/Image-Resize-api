import { createLogger, transports, format } from 'winston';
import 'winston-daily-rotate-file';
import * as util from 'node:util';
const { combine, timestamp, printf, colorize, splat } = format;

const logPattern = printf((transformableInfo) => {
    splat().transform(transformableInfo);
    const { level, message, timestamp } = transformableInfo;
    return `${timestamp} [${level}] - ${message}`;
});

const consoleAppender = () =>
    new transports.Console({
        format: combine(
            timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            logPattern,
            colorize({ all: true }),
            format.errors({ stack: true }),
        ),
    });

const fileAppender = (level: string) =>
    new transports.DailyRotateFile({
        filename: `${process.env.LOGGING_FILE_PATH}/${level}-%DATE%.log`,
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '7d',
        level,
        json: false,
        format: combine(
            timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            logPattern,
            colorize({ all: false }),
            format.errors({ stack: true }),
        ),
    });

const logger = createLogger({
    defaultMeta: { service: ' image-service' },
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(consoleAppender());
} else {
    logger.add(fileAppender('info'));
    logger.add(fileAppender('error'));
}

export default {
    info: (...message: any) => logger.info(util.format(...message)),
    debug: (...message: any) => logger.debug(message),
    error: (...message: any) => logger.error(message),
};
