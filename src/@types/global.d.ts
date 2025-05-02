import { Request, Response } from 'express';
import { ImageData } from '@utils/imageClient.js';

declare global {
    interface ImageRequest extends Request {
        imageData?: ImageData;
    }
}
