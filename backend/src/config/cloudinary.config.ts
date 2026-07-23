import cloudinary from 'cloudinary';
import { env } from './env.config';

cloudinary.v2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const cloudinaryInstance = cloudinary.v2;

export const CLOUDINARY_FOLDERS = {
  AVATARS: 'wheelswap/avatars',
  KYC: 'wheelswap/kyc',
  VEHICLES: 'wheelswap/vehicles',
} as const;
