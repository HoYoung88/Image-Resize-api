import express from 'express';
import imageController from '@controllers/imageController.js';
import { checkImage, validImageParams } from '@middlewares/imageMiddleware.js';

const router = express.Router();
router.get('/resize-image', validImageParams, checkImage, imageController.resizeImage);
router.get('/img/:path/:filename{.:ext}', validImageParams, checkImage, imageController.resizeImage);

export default router;
