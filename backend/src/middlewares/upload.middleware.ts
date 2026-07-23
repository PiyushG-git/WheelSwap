import multer from 'multer';
import { AppError } from '../utils/appError.util';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_DOC_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP images are allowed', 400));
  }
};

const documentFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_DOC_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, WebP, and PDF files are allowed', 400));
  }
};

/**
 * Memory storage (buffers go straight to Cloudinary)
 */
const memoryStorage = multer.memoryStorage();

/**
 * Single image upload (e.g., avatar)
 */
export const uploadSingleImage = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

/**
 * Multiple vehicle images (max 10)
 */
export const uploadVehicleImages = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
});

/**
 * KYC documents — images or PDFs (max 5 files)
 */
export const uploadKycDocuments = multer({
  storage: memoryStorage,
  fileFilter: documentFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 5 },
});
