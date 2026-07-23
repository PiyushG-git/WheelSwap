import { UserRepository } from '../repositories/user.repository';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/upload.util';
import { CLOUDINARY_FOLDERS } from '../config/cloudinary.config';
import { Errors } from '../utils/appError.util';
import type { UpdateProfileInput } from '../validators/user.validator';

export const UserService = {
  async getProfile(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) throw Errors.notFound('User');
    return user;
  },

  async getPublicProfile(userId: string) {
    const user = await UserRepository.findPublicById(userId);
    if (!user) throw Errors.notFound('User');
    return user;
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    return UserRepository.update(userId, input);
  },

  async uploadAvatar(userId: string, buffer: Buffer): Promise<string> {
    const user = await UserRepository.findById(userId);
    if (!user) throw Errors.notFound('User');

    const { url, publicId } = await uploadToCloudinary(
      buffer,
      CLOUDINARY_FOLDERS.AVATARS,
      {
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        publicId: `avatar_${userId}`,
      }
    );

    await UserRepository.update(userId, { avatarUrl: url });
    return url;
  },
};
