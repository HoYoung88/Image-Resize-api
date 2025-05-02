import fetch, { RequestInfo, Response } from 'node-fetch';
import { fileTypeFromBuffer } from 'file-type';
import { imageSize } from 'image-size';
import ImageDataModel, { ImageData } from '@models/imageDataModel.js';

export const fetchImage = async (url: URL | RequestInfo | null): Promise<ImageData> => {
    if (url) {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            },
        });

        isSuccess(response.status);
        validImageContentType(response);

        const imageBuffer = await response.arrayBuffer();
        const fileTypeResult = await fileTypeFromBuffer(imageBuffer);
        let ext = '';
        let mime = '';

        if (fileTypeResult) {
            ext = fileTypeResult.ext;
            mime = fileTypeResult.mime;
        }

        const sizeOf = imageSize(new Uint8Array(imageBuffer));
        return new ImageDataModel(imageBuffer, ext, mime, sizeOf.width ?? 0, sizeOf.height ?? 0);
    } else {
        throw new ImageClientError(400, 'Invalid image URL');
    }
};

const isSuccess = (statusCode: number) => {
    if (!(statusCode >= 200 && statusCode < 300)) {
        throw new ImageClientError(400, 'Invalid image URL');
    }
};

const validImageContentType = (response: Response) => {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
        throw new ImageClientError(400, 'URL is not an image');
    }
};

export class ImageClientError extends Error {
    status: number;
    constructor(status: number = 400, message: string) {
        super(message);
        this.status = status;
    }
}

export default {};
