import sharp, { FormatEnum } from 'sharp';
import { ImageData } from '@models/imageDataModel.js';
import ImageResizeDataModel, { ImageResizeData } from '@models/imageResizeDataModel.js';
import { InternalServerError } from '@utils/errors.js';
import logger from '@utils/logger.js';

enum FitEnumType {
    contain = 'contain', // 가로 세로 비율을 유지하고 필요한 경우 "레터박스"를 사용하여 제공된 두 치수 모두에 포함
    cover = 'cover', // 가로 세로 비율을 유지하고 이미지가 맞게 자르기/잘려 제공된 두 치수를 모두 포함하는지 확인
    fill = 'fill', // 입력의 종횡비를 무시하고 제공된 두 치수로 늘인다
    inside = 'inside', // 가로 세로 비율을 유지하면서 이미지의 크기를 지정된 크기보다 작거나 같게 유지하면서 가능한 한 크게 이미지 크기를 조정
    outside = 'outside', // 종횡비를 유지하면서 이미지의 크기가 지정된 두 가지보다 크거나 같도록 최대한 작게 이미지 크기를 조정
}

const resizeImage = async (
    imageData: ImageData,
    width: number,
    height: number,
    quality: number,
    isCrop: boolean,
): Promise<ImageResizeData> => {
    try {
        if (!imageData.buffer) {
            throw new InternalServerError('Image buffer is missing');
        }

        const { buffer, extension } = imageData;
        const pipeline = getInstance(buffer, extension);
        const metadata = await pipeline.metadata();

        // GIF는 WebP로, 나머지는 AVIF로 변환
        const toFormat: keyof FormatEnum = extension === 'gif' ? 'webp' : 'avif';

        if (isCrop) {
            // 크롭 모드: 지정된 크기로 리사이즈 후 추출
            pipeline.resize(width, height, { fit: FitEnumType.cover, position: 'center' });
        } else {
            // 일반 모드: 비율 유지하며 리사이즈
            pipeline.resize(width, height, { fit: FitEnumType.inside, withoutEnlargement: true });
        }

        // 포맷 변환 및 품질 설정
        const formatOptions: sharp.WebpOptions | sharp.AvifOptions = {
            quality: Math.round(quality * 100),
        };

        // GIF 메타데이터 전달 (애니메이션 지원)
        if (extension === 'gif' && metadata.loop !== undefined) {
            (formatOptions as sharp.WebpOptions).loop = metadata.loop;
        }
        if (extension === 'gif' && metadata.delay !== undefined) {
            (formatOptions as sharp.WebpOptions).delay = metadata.delay;
        }

        pipeline.toFormat(toFormat, formatOptions);

        const convertImageBuffer = await pipeline.toBuffer();
        return new ImageResizeDataModel(convertImageBuffer, toFormat);
    } catch (error) {
        logger.error('Error in resizeImage service:', error);
        if (error instanceof InternalServerError) {
            throw error;
        }
        throw new InternalServerError(`Failed to resize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const getInstance = (buffer: ArrayBuffer, extension: string): sharp.Sharp => {
    const bufferNode = Buffer.from(buffer);
    return extension === 'gif' ? sharp(bufferNode, { animated: true, pages: -1 }) : sharp(bufferNode);
};

export default { resizeImage };
