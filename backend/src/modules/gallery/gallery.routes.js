import { Router } from 'express';
import * as galleryController from './gallery.controller.js';
import { authenticateAdmin } from '../../middlewares/auth.js';
import { upload } from '../../middlewares/upload.js';

export const publicGalleryRouter = Router();
publicGalleryRouter.get('/', galleryController.getPublicGallery);

export const adminGalleryRouter = Router();
adminGalleryRouter.use(authenticateAdmin);
adminGalleryRouter.get('/', galleryController.getAdminGallery);
adminGalleryRouter.post('/', galleryController.createGalleryImage);
adminGalleryRouter.patch('/:id', galleryController.updateGalleryImage);
adminGalleryRouter.delete('/:id', galleryController.deleteGalleryImage);
adminGalleryRouter.post('/upload', upload.single('image'), galleryController.uploadImage);
