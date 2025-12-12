import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: number;
    CDN_DOMAIN: string;
    LOGGING_FILE_PATH: string;
    MAX_IMAGE_SIZE_MB: number;
    MAX_IMAGE_DIMENSION: number;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
}

const getEnv = (): EnvConfig => {
    const requiredEnvVars = ['CDN_DOMAIN'];
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    return {
        NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
        PORT: parseInt(process.env.PORT || '3000', 10),
        CDN_DOMAIN: process.env.CDN_DOMAIN!,
        LOGGING_FILE_PATH: process.env.LOGGING_FILE_PATH || './logs',
        MAX_IMAGE_SIZE_MB: parseInt(process.env.MAX_IMAGE_SIZE_MB || '10', 10),
        MAX_IMAGE_DIMENSION: parseInt(process.env.MAX_IMAGE_DIMENSION || '5000', 10),
        RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
        RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    };
};

export const env = getEnv();

