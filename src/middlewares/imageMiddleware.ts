import { NextFunction, Response } from 'express';
import { fetchImage } from '@utils/imageClient.js';
import { T } from '@utils/typeUtils.js';

export const checkImage = async (req: ImageRequest, res: Response, next: NextFunction) => {
    let url: URL | null;

    if (req.params.path) {
        const { path, filename, ext } = req.params;
        url = URL.parse(`/img/${path}/${filename}.${ext}`, process.env.CDN_DOMAIN);
    } else {
        url = new URL(req.query.url as string);
    }

    req.imageData = await fetchImage(url);
    next();
};

export const validImageParams = (req: ImageRequest, res: Response, next: NextFunction) => {
    const w = req.query.w;
    const h = req.query.h;
    const q = req.query.q;

    if (w !== undefined) {
        if (!T.isNumeric(w)) throw new ParamsError(400, '파라미터 확인 : w');
    }

    if (h !== undefined) {
        if (!T.isNumeric(h)) throw new ParamsError(400, '파라미터 확인 : h');
    }

    if (q !== undefined) {
        if (!T.isNumeric(q)) {
            throw new ParamsError(400, '파라미터 확인 : q (허용 범위 0.0 ~ 1.0');
        }
    }
    next();
};

class ParamsError extends Error {
    status: number;
    constructor(status: number = 400, message: string) {
        super(message);
        this.status = status;
    }
}
