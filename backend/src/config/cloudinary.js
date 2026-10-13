import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

export function isCloudinaryConfigured() {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  );
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} buffer 
 * @param {string} folder 
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export function uploadImageBuffer(buffer, folder = 'mood_studio') {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(new Error('Cloudinary is not configured. Please supply API credentials.'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
      },
      (error, result) => {
        if (error) {
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        if (!result || !result.secure_url || !result.public_id) {
          return reject(new Error('Cloudinary response missing required image data.'));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Deletes an image from Cloudinary using server-controlled publicId
 * @param {string} publicId 
 * @returns {Promise<any>}
 */
export async function deleteImage(publicId) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured.');
  }
  if (!publicId) {
    throw new Error('public_id is required for deletion.');
  }
  return await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
