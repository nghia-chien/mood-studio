import { GalleryImage } from './gallery.model.js';
import { Concept } from '../concepts/concept.model.js';
import { uploadImageBuffer, deleteImage } from '../../config/cloudinary.js';

export async function getPublicGallery({ conceptId } = {}) {
  const query = { status: 'PUBLISHED' };
  if (conceptId) {
    query.conceptId = conceptId;
  }

  return await GalleryImage.find(query)
    .populate('conceptId', 'name slug')
    .sort({ displayOrder: 1, createdAt: -1 })
    .lean();
}

export async function getAdminGallery({ conceptId, status, page = 1, limit = 50 } = {}) {
  const query = {};
  if (conceptId) query.conceptId = conceptId;
  if (status) query.status = status;

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const total = await GalleryImage.countDocuments(query);
  const items = await GalleryImage.find(query)
    .populate('conceptId', 'name slug')
    .sort({ displayOrder: 1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .lean();

  return {
    items,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / limit)
    }
  };
}

export async function createGalleryImage(data) {
  if (!data.imageUrl || !data.publicId) {
    const error = new Error('imageUrl and publicId are required');
    error.statusCode = 400;
    throw error;
  }

  if (data.conceptId) {
    const concept = await Concept.findById(data.conceptId);
    if (!concept) {
      const error = new Error('Referenced concept does not exist');
      error.statusCode = 400;
      throw error;
    }
  }

  const image = new GalleryImage({
    conceptId: data.conceptId || null,
    imageUrl: data.imageUrl.trim(),
    publicId: data.publicId.trim(),
    caption: data.caption ? data.caption.trim() : '',
    status: data.status || 'PUBLISHED',
    displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0
  });

  return await image.save();
}

export async function updateGalleryImage(id, data) {
  const image = await GalleryImage.findById(id);
  if (!image) {
    const error = new Error('Gallery image not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.conceptId !== undefined) {
    if (data.conceptId) {
      const concept = await Concept.findById(data.conceptId);
      if (!concept) {
        const error = new Error('Referenced concept does not exist');
        error.statusCode = 400;
        throw error;
      }
      image.conceptId = data.conceptId;
    } else {
      image.conceptId = null;
    }
  }

  if (data.caption !== undefined) image.caption = data.caption.trim();
  if (data.status !== undefined) image.status = data.status;
  if (data.displayOrder !== undefined) image.displayOrder = data.displayOrder;

  return await image.save();
}

export async function deleteGalleryImage(id) {
  const image = await GalleryImage.findById(id);
  if (!image) {
    const error = new Error('Gallery image not found');
    error.statusCode = 404;
    throw error;
  }

  // Delete from Cloudinary using server-controlled publicId
  if (image.publicId) {
    try {
      await deleteImage(image.publicId);
    } catch (err) {
      console.warn(`[STORAGE WARNING] Failed to delete Cloudinary asset ${image.publicId}:`, err.message);
    }
  }

  await GalleryImage.findByIdAndDelete(id);
  return { message: 'Image deleted successfully' };
}

export async function uploadAndCreateImage({ fileBuffer, caption, conceptId, displayOrder, status }) {
  if (!fileBuffer) {
    const error = new Error('Image file buffer is required');
    error.statusCode = 400;
    throw error;
  }

  if (conceptId) {
    const concept = await Concept.findById(conceptId);
    if (!concept) {
      const error = new Error('Referenced concept does not exist');
      error.statusCode = 400;
      throw error;
    }
  }

  // Upload to Cloudinary
  const uploadResult = await uploadImageBuffer(fileBuffer, 'mood_studio/gallery');

  try {
    const image = new GalleryImage({
      conceptId: conceptId || null,
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      caption: caption ? caption.trim() : '',
      status: status || 'PUBLISHED',
      displayOrder: typeof displayOrder === 'number' ? displayOrder : 0
    });

    return await image.save();
  } catch (dbError) {
    // If DB save fails, attempt cleanup in Cloudinary so asset is not orphaned
    try {
      await deleteImage(uploadResult.public_id);
    } catch (cleanupErr) {
      console.error('[STORAGE WARNING] Failed to cleanup orphaned upload:', cleanupErr.message);
    }
    throw dbError;
  }
}
