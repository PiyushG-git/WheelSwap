import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';

export interface JwtAccessPayload {
  sub: string;      // userId
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  sub: string;      // userId
  tokenId: string;  // RefreshToken.id for rotation
  iat?: number;
  exp?: number;
}

export interface JwtEmailPayload {
  sub: string;      // userId
  email: string;
  iat?: number;
  exp?: number;
}

// ─────────────────────────────────────────────
// Access Token
// ─────────────────────────────────────────────

export function signAccessToken(payload: Omit<JwtAccessPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): JwtAccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
}

// ─────────────────────────────────────────────
// Refresh Token
// ─────────────────────────────────────────────

export function signRefreshToken(payload: Omit<JwtRefreshPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyRefreshToken(token: string): JwtRefreshPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
}

// ─────────────────────────────────────────────
// Email Verification Token
// ─────────────────────────────────────────────

export function signEmailToken(payload: Omit<JwtEmailPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_EMAIL_SECRET, {
    expiresIn: env.JWT_EMAIL_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyEmailToken(token: string): JwtEmailPayload {
  return jwt.verify(token, env.JWT_EMAIL_SECRET) as JwtEmailPayload;
}

// ─────────────────────────────────────────────
// Password Reset Token
// ─────────────────────────────────────────────

export function signPasswordResetToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email }, env.JWT_PASSWORD_RESET_SECRET, {
    expiresIn: env.JWT_PASSWORD_RESET_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyPasswordResetToken(token: string): JwtEmailPayload {
  return jwt.verify(token, env.JWT_PASSWORD_RESET_SECRET) as JwtEmailPayload;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export function getRefreshTokenExpiry(): Date {
  // 7 days from now
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
}
