import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponseBuilder } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';

export const AuthController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    ApiResponseBuilder.created(
      res,
      result,
      'Registration successful. Please verify your email.'
    );
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await AuthService.login(req.body);
    ApiResponseBuilder.success(res, { user, tokens }, 'Login successful');
  }),

  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await AuthService.refreshToken(refreshToken);
    ApiResponseBuilder.success(res, tokens, 'Token refreshed');
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    await AuthService.logout(refreshToken);
    ApiResponseBuilder.success(res, null, 'Logged out successfully');
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;
    await AuthService.verifyEmail(token);
    ApiResponseBuilder.success(res, null, 'Email verified successfully');
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await AuthService.forgotPassword(email);
    // Always return success to prevent email enumeration
    ApiResponseBuilder.success(
      res,
      null,
      'If that email is registered, a reset link has been sent.'
    );
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    await AuthService.resetPassword(token, password);
    ApiResponseBuilder.success(res, null, 'Password reset successfully');
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;
    await AuthService.changePassword(userId, currentPassword, newPassword);
    ApiResponseBuilder.success(res, null, 'Password changed successfully');
  }),
};
