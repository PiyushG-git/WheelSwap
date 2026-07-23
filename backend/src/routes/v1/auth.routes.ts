import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authLimiter } from '../../middlewares/rateLimit.middleware';
import {
  RegisterSchema,
  LoginSchema,
  VerifyEmailSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  RefreshTokenSchema,
  ChangePasswordSchema,
} from '../../validators/auth.validator';

const router = Router();

// Public routes
router.post('/register', authLimiter, validate(RegisterSchema), AuthController.register);
router.post('/login', authLimiter, validate(LoginSchema), AuthController.login);
router.post('/refresh-token', validate(RefreshTokenSchema), AuthController.refreshToken);
router.post('/verify-email', validate(VerifyEmailSchema), AuthController.verifyEmail);
router.post('/forgot-password', authLimiter, validate(ForgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', validate(ResetPasswordSchema), AuthController.resetPassword);

// Protected routes
router.post('/logout', authenticate, validate(RefreshTokenSchema), AuthController.logout);
router.patch('/change-password', authenticate, validate(ChangePasswordSchema), AuthController.changePassword);

export default router;
