import { Response } from 'express';
import imageService from '@services/imageService.js';
import { NumberUtils } from '@utils/typeUtils.js';

export default {
    resizeImage: async (req: ImageRequest, res: Response) => {
        const imageData = req.imageData;

        const w = NumberUtils.getValueOrDefault(req.query.w, imageData?.width);
        const h = NumberUtils.getValueOrDefault(req.query.h, imageData?.height);
        const q = NumberUtils.getValueOrDefault(req.query.q, 0.8);

        const imageResizeData = await imageService.resizeImage(imageData, w, h, q, req.query.c == 'c');

        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1년
        res.setHeader('Content-Type', 'image/' + imageResizeData.mimeType);
        res.end(imageResizeData.buffer, 'binary');
    },
};
