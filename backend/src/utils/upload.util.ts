import { cloudinaryInstance, CLOUDINARY_FOLDERS } from '../config/cloudinary.config';
import { AppError } from './appError.util';
import { logger } from '../config/logger.config';

export interface UploadResult {
  url: string;
  publicId: string;
}

type CloudinaryFolder = (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS];

/**
 * Upload a file buffer to Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: CloudinaryFolder,
  options: {
    resourceType?: 'image' | 'raw' | 'auto';
    transformation?: object[];
    publicId?: string;
  } = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinaryInstance.uploader.upload_stream(
      {
        folder,
        resource_type: options.resourceType ?? 'image',
        transformation: options.transformation ?? [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
        ...(options.publicId && { public_id: options.publicId }),
      },
      (error, result) => {
        if (error || !result) {
          logger.error('Cloudinary upload error:', error);
          reject(new AppError('File upload failed', 500));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Delete a file from Cloudinary by publicId
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinaryInstance.uploader.destroy(publicId);
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
  }
}

/**
 * Upload multiple buffers in parallel
 */
export async function uploadMultipleToCloudinary(
  buffers: Buffer[],
  folder: CloudinaryFolder
): Promise<UploadResult[]> {
  return Promise.all(buffers.map((buf) => uploadToCloudinary(buf, folder)));
}
