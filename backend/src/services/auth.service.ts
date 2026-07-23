import { UserRepository } from '../repositories/user.repository';
import { TokenRepository } from '../repositories/token.repository';
import { hashPassword, comparePassword } from '../utils/hash.util';
import {
  signAccessToken,
  signRefreshToken,
  signEmailToken,
  signPasswordResetToken,
  verifyRefreshToken,
  verifyEmailToken,
  verifyPasswordResetToken,
  getRefreshTokenExpiry,
} from '../utils/jwt.util';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '../utils/email.util';
import { Errors } from '../utils/appError.util';
import type { RegisterInput, LoginInput } from '../validators/auth.validator';
import { v4 as uuidv4 } from 'uuid';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function generateTokens(user: { id: string; email: string; role: string }): {
  accessToken: string;
  refreshTokenValue: string;
  refreshTokenId: string;
} {
  const refreshTokenId = uuidv4();
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshTokenValue = signRefreshToken({
    sub: user.id,
    tokenId: refreshTokenId,
  });
  return { accessToken, refreshTokenValue, refreshTokenId };
}

// ─────────────────────────────────────────────
// Auth Service
// ─────────────────────────────────────────────

export const AuthService = {
  /**
   * Register with email + password
   */
  async register(input: RegisterInput) {
    const exists = await UserRepository.emailExists(input.email);
    if (exists) throw Errors.conflict('An account with this email already exists');

    const hashedPwd = await hashPassword(input.password);
    const user = await UserRepository.create({
      email: input.email,
      name: input.name,
      phone: input.phone,
      password: hashedPwd,
    });

    // Send verification email
    const emailToken = signEmailToken({ sub: user.id, email: user.email });
    await sendVerificationEmail(user.email, user.name, emailToken);

    return { user };
  },

  /**
   * Login with email + password
   */
  async login(input: LoginInput): Promise<{ user: unknown; tokens: AuthTokens }> {
    const user = await UserRepository.findByEmail(input.email);
    if (!user) throw Errors.unauthorized('Invalid email or password');
    if (!user.password) throw Errors.unauthorized('Please login with Google');
    if (!user.isActive) throw Errors.unauthorized('Account has been deactivated');

    const isValid = await comparePassword(input.password, user.password);
    if (!isValid) throw Errors.unauthorized('Invalid email or password');

    const { accessToken, refreshTokenValue, refreshTokenId } = generateTokens(user);

    await TokenRepository.createRefreshToken({
      userId: user.id,
      token: refreshTokenValue,
      expiresAt: getRefreshTokenExpiry(),
    });

    const { password: _, ...safeUser } = user;
    return {
      user: safeUser,
      tokens: { accessToken, refreshToken: refreshTokenValue },
    };
  },

  /**
   * Rotate refresh token (silent re-auth)
   */
  async refreshToken(token: string): Promise<AuthTokens> {
    const payload = verifyRefreshToken(token);

    const storedToken = await TokenRepository.findByToken(token);
    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw Errors.unauthorized('Invalid or expired refresh token');
    }

    // Revoke old token (rotation)
    await TokenRepository.revokeToken(storedToken.id);

    const user = await UserRepository.findByIdWithPassword(payload.sub);
    if (!user || !user.isActive) throw Errors.unauthorized('User not found');

    const { accessToken, refreshTokenValue } = generateTokens(user);

    await TokenRepository.createRefreshToken({
      userId: user.id,
      token: refreshTokenValue,
      expiresAt: getRefreshTokenExpiry(),
    });

    return { accessToken, refreshToken: refreshTokenValue };
  },

  /**
   * Logout — revoke refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    const storedToken = await TokenRepository.findByToken(refreshToken);
    if (storedToken) {
      await TokenRepository.revokeToken(storedToken.id);
    }
  },

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    const payload = verifyEmailToken(token);

    const user = await UserRepository.findById(payload.sub);
    if (!user) throw Errors.notFound('User');
    if (user.isEmailVerified) throw Errors.conflict('Email already verified');

    await UserRepository.markEmailVerified(payload.sub);
    await sendWelcomeEmail(user.email, user.name);
  },

  /**
   * Send password reset email
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await UserRepository.findByEmail(email);
    // Don't reveal if user exists
    if (!user) return;

    const token = signPasswordResetToken(user.id, user.email);
    await sendPasswordResetEmail(user.email, user.name, token);
  },

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const payload = verifyPasswordResetToken(token);

    const user = await UserRepository.findById(payload.sub);
    if (!user) throw Errors.notFound('User');

    const hashed = await hashPassword(newPassword);
    await UserRepository.updatePassword(payload.sub, hashed);

    // Invalidate all sessions
    await TokenRepository.revokeAllUserTokens(payload.sub);
  },

  /**
   * Change password (authenticated user)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await UserRepository.findByIdWithPassword(userId);
    if (!user || !user.password) throw Errors.badRequest('Cannot change password for OAuth accounts');

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) throw Errors.unauthorized('Current password is incorrect');

    const hashed = await hashPassword(newPassword);
    await UserRepository.updatePassword(userId, hashed);
    await TokenRepository.revokeAllUserTokens(userId);
  },
};
