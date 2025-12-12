import { Response, NextFunction } from 'express';
import imageService from '@services/imageService.js';
import { NumberUtils } from '@utils/typeUtils.js';
import { InternalServerError } from '@utils/errors.js';
import logger from '@utils/logger.js';

export default {
    resizeImage: async (req: ImageRequest, res: Response, next: NextFunction) => {
        try {
            const imageData = req.imageData;

            if (!imageData) {
                throw new InternalServerError('Image data is missing');
            }

            const w = NumberUtils.getValueOrDefault(req.query.w, imageData.width);
            const h = NumberUtils.getValueOrDefault(req.query.h, imageData.height);
            const q = NumberUtils.getValueOrDefault(req.query.q, 0.8);
            const isCrop = req.query.c === 'c';

            const imageResizeData = await imageService.resizeImage(imageData, w, h, q, isCrop);

            if (!imageResizeData.buffer || !imageResizeData.mimeType) {
                throw new InternalServerError('Failed to resize image');
            }

            // 캐시 헤더 설정 (1년)
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            res.setHeader('Content-Type', `image/${imageResizeData.mimeType}`);
            res.setHeader('Content-Length', imageResizeData.buffer.byteLength.toString());

            res.end(Buffer.from(imageResizeData.buffer), 'binary');
        } catch (error) {
            logger.error('Error in resizeImage controller:', error);
            next(error);
        }
    },
};
