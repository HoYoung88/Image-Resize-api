export interface ImageData {
    buffer?: ArrayBuffer;
    extension: string;
    mimeType: string;
    width: number;
    height: number;
}

export class ImageDataModel implements ImageData {
    buffer?: ArrayBuffer;
    extension: string;
    mimeType: string;
    width: number;
    height: number;

    constructor(buffer: ArrayBuffer, extension: string, mimeType: string, width: number, height: number) {
        this.buffer = buffer;
        this.extension = extension;
        this.mimeType = mimeType;
        this.width = width;
        this.height = height;
    }
}

export default ImageDataModel;
