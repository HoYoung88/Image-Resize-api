export interface ImageResizeData {
    buffer?: ArrayBuffer;
    mimeType?: string;
}

export class ImageResizeDataModel implements ImageResizeData {
    buffer?: ArrayBuffer;
    mimeType?: string;

    constructor(buffer?: ArrayBuffer, mimeType?: string) {
        this.buffer = buffer;
        this.mimeType = mimeType;
    }
}

export default ImageResizeDataModel;
