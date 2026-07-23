import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { ApiResponseBuilder } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { Errors } from '../utils/appError.util';

export const UserController = {
  getMe: asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.getProfile(req.user!.id);
    ApiResponseBuilder.success(res, user);
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.updateProfile(req.user!.id, req.body);
    ApiResponseBuilder.success(res, user, 'Profile updated successfully');
  }),

  uploadAvatar: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw Errors.badRequest('No image file provided');
    const avatarUrl = await UserService.uploadAvatar(req.user!.id, req.file.buffer);
    ApiResponseBuilder.success(res, { avatarUrl }, 'Avatar uploaded successfully');
  }),

  getPublicProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.getPublicProfile(req.params.id);
    ApiResponseBuilder.success(res, user);
  }),
};
