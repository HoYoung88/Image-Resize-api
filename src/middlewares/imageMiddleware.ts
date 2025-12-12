import { NextFunction, Response } from 'express';
import { fetchImage } from '@utils/imageClient.js';
import { T } from '@utils/typeUtils.js';
import { ParamsError, ValidationError } from '@utils/errors.js';
import { env } from '@config/env.js';

export const checkImage = async (req: ImageRequest, res: Response, next: NextFunction) => {
    try {
        let url: URL | null = null;

        if (req.params.path) {
            const { path, filename, ext } = req.params;
            // CDN 도메인과 경로를 결합하여 URL 생성
            const fullPath = `/img/${path}/${filename}.${ext}`;
            url = new URL(fullPath, `https://${env.CDN_DOMAIN}`);
        } else if (req.query.url) {
            const urlString = req.query.url as string;
            try {
                url = new URL(urlString);
            } catch (error) {
                throw new ValidationError('Invalid URL format');
            }
        } else {
            throw new ValidationError('Image URL is required (url parameter or path parameter)');
        }

        // URL 프로토콜 검증 (http, https만 허용)
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            throw new ValidationError('Only HTTP and HTTPS protocols are allowed');
        }

        req.imageData = await fetchImage(url);
        next();
    } catch (error) {
        next(error);
    }
};

export const validImageParams = (req: ImageRequest, res: Response, next: NextFunction) => {
    try {
        const w = req.query.w;
        const h = req.query.h;
        const q = req.query.q;

        if (w !== undefined) {
            if (!T.isNumeric(w)) {
                throw new ParamsError('파라미터 확인: w (숫자여야 합니다)');
            }
            const width = Number(w);
            if (width <= 0 || width > env.MAX_IMAGE_DIMENSION) {
                throw new ParamsError(`파라미터 확인: w (1 ~ ${env.MAX_IMAGE_DIMENSION} 사이의 값이어야 합니다)`);
            }
        }

        if (h !== undefined) {
            if (!T.isNumeric(h)) {
                throw new ParamsError('파라미터 확인: h (숫자여야 합니다)');
            }
            const height = Number(h);
            if (height <= 0 || height > env.MAX_IMAGE_DIMENSION) {
                throw new ParamsError(`파라미터 확인: h (1 ~ ${env.MAX_IMAGE_DIMENSION} 사이의 값이어야 합니다)`);
            }
        }

        if (q !== undefined) {
            if (!T.isNumeric(q)) {
                throw new ParamsError('파라미터 확인: q (숫자여야 합니다, 허용 범위: 0.0 ~ 1.0)');
            }
            const quality = Number(q);
            if (quality < 0 || quality > 1) {
                throw new ParamsError('파라미터 확인: q (허용 범위: 0.0 ~ 1.0)');
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};
