import fetch, { Response } from 'node-fetch';
import { fileTypeFromBuffer } from 'file-type';
import { imageSize } from 'image-size';
import ImageDataModel, { ImageData } from '@models/imageDataModel.js';
import { ImageClientError } from '@utils/errors.js';
import { env } from '@config/env.js';
import logger from '@utils/logger.js';

const MAX_IMAGE_SIZE_BYTES = env.MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];

export const fetchImage = async (url: URL): Promise<ImageData> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                Accept: 'image/*',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        validateResponse(response);

        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_SIZE_BYTES) {
            throw new ImageClientError(
                413,
                `Image size exceeds maximum allowed size of ${env.MAX_IMAGE_SIZE_MB}MB`,
            );
        }

        const imageBuffer = await response.arrayBuffer();

        if (imageBuffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
            throw new ImageClientError(
                413,
                `Image size exceeds maximum allowed size of ${env.MAX_IMAGE_SIZE_MB}MB`,
            );
        }

        const fileTypeResult = await fileTypeFromBuffer(Buffer.from(imageBuffer));

        if (!fileTypeResult) {
            throw new ImageClientError(400, 'Unable to determine image type');
        }

        const { ext, mime } = fileTypeResult;

        if (!ALLOWED_IMAGE_TYPES.includes(mime)) {
            throw new ImageClientError(400, `Unsupported image type: ${mime}`);
        }

        const sizeOf = imageSize(Buffer.from(imageBuffer));

        if (!sizeOf.width || !sizeOf.height) {
            throw new ImageClientError(400, 'Unable to determine image dimensions');
        }

        if (sizeOf.width > env.MAX_IMAGE_DIMENSION || sizeOf.height > env.MAX_IMAGE_DIMENSION) {
            throw new ImageClientError(
                413,
                `Image dimensions exceed maximum allowed size of ${env.MAX_IMAGE_DIMENSION}x${env.MAX_IMAGE_DIMENSION}`,
            );
        }

        return new ImageDataModel(imageBuffer, ext, mime, sizeOf.width, sizeOf.height);
    } catch (error) {
        if (error instanceof ImageClientError) {
            throw error;
        }
        if (error instanceof Error && error.name === 'AbortError') {
            throw new ImageClientError(408, 'Request timeout: Image fetch exceeded 30 seconds');
        }
        logger.error('Error fetching image:', error);
        throw new ImageClientError(500, `Failed to fetch image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const validateResponse = (response: Response): void => {
    if (!(response.status >= 200 && response.status < 300)) {
        throw new ImageClientError(
            response.status,
            `Failed to fetch image: HTTP ${response.status} ${response.statusText}`,
        );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
        throw new ImageClientError(400, 'URL does not point to an image');
    }
};

export default {};
