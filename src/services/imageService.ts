import sharp, { FormatEnum } from 'sharp';
import { ImageData } from '@models/imageDataModel.js';
import ImageResizeDataModel, { ImageResizeData } from '@models/imageResizeDataModel.js';

enum FitEnumType {
    contain = 'contain', //가로 세로 비율을 유지하고 필요한 경우 "레터박스"를 사용하여 제공된 두 치수 모두에 포함
    cover = 'cover', // 가로 세로 비율을 유지하고 이미지가 맞게 자르기/잘려 제공된 두 치수를 모두 포함하는지 확인
    fill = 'fill', //입력의 종횡비를 무시하고 제공된 두 치수로 늘인다
    inside = 'inside', //가로 세로 비율을 유지하면서 이미지의 크기를 지정된 크기보다 작거나 같게 유지하면서 가능한 한 크게 이미지 크기를 조정
    outside = 'outside', //종횡비를 유지하면서 이미지의 크기가 지정된 두 가지보다 크거나 같도록 최대한 작게 이미지 크기를 조정
}

const resizeImage = async (
    imageData: ImageData,
    width: number,
    height: number,
    quality: number,
    isCrop: boolean,
): Promise<ImageResizeData> => {
    const { buffer, extension } = imageData;
    const pipeline = getInstance(buffer, extension);
    const metadata = await pipeline.metadata();
    let toFormat: keyof FormatEnum = extension === 'gif' ? 'webp' : 'avif';

    if (isCrop) {
        pipeline.resize(width, height);
        pipeline.extract({ left: 0, top: 0, width, height });
    } else {
        pipeline.resize(width, height, { fit: FitEnumType.outside });
    }

    pipeline.toFormat(toFormat, {
        quality: quality * 100,
        loop: metadata.loop,
        delay: metadata.delay,
    });

    const convertImageBuffer = await pipeline.toBuffer();
    return new ImageResizeDataModel(convertImageBuffer, toFormat);
};

const getInstance = (buffer?: ArrayBuffer, extension?: string): sharp.Sharp =>
    extension === 'gif' ? sharp(buffer, { animated: true, pages: -1 }) : sharp(buffer);

export default { resizeImage };
