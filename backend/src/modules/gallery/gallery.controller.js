import * as galleryService from './gallery.service.js';

export async function getPublicGallery(req, res, next) {
  try {
    const { conceptId } = req.query;
    const images = await galleryService.getPublicGallery({ conceptId });
    res.status(200).json({
      success: true,
      data: images
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminGallery(req, res, next) {
  try {
    const { conceptId, status, page, limit } = req.query;
    const result = await galleryService.getAdminGallery({ conceptId, status, page, limit });
    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

export async function createGalleryImage(req, res, next) {
  try {
    const image = await galleryService.createGalleryImage(req.body);
    res.status(201).json({
      success: true,
      data: image
    });
  } catch (error) {
    next(error);
  }
}

export async function updateGalleryImage(req, res, next) {
  try {
    const image = await galleryService.updateGalleryImage(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: image
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteGalleryImage(req, res, next) {
  try {
    const result = await galleryService.deleteGalleryImage(req.params.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No image file uploaded. Supported formats: JPG, PNG, WebP up to 10MB.',
          code: 'FILE_REQUIRED'
        }
      });
    }

    const { caption, conceptId, displayOrder, status } = req.body;
    const image = await galleryService.uploadAndCreateImage({
      fileBuffer: req.file.buffer,
      caption,
      conceptId: conceptId || null,
      displayOrder: displayOrder ? Number(displayOrder) : 0,
      status: status || 'PUBLISHED'
    });

    res.status(201).json({
      success: true,
      data: image
    });
  } catch (error) {
    next(error);
  }
}
