import { prisma } from '../config/database.config';
import { Prisma } from '@prisma/client';

// ─────────────────────────────────────────────
// Selects (reusable field sets)
// ─────────────────────────────────────────────

export const userPublicSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  city: true,
  state: true,
  isKycVerified: true,
  createdAt: true,
} as const;

export const userPrivateSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  avatarUrl: true,
  role: true,
  bio: true,
  city: true,
  state: true,
  country: true,
  isEmailVerified: true,
  isPhoneVerified: true,
  isKycVerified: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ─────────────────────────────────────────────
// Repository Methods
// ─────────────────────────────────────────────

export const UserRepository = {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: userPrivateSelect,
    });
  },

  async findByIdWithPassword(id: string) {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
  },

  async findByGoogleId(googleId: string) {
    return prisma.user.findUnique({
      where: { googleId },
    });
  },

  async findPublicById(id: string) {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: userPublicSelect,
    });
  },

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data, select: userPrivateSelect });
  },

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: userPrivateSelect,
    });
  },

  async markEmailVerified(id: string) {
    return prisma.user.update({
      where: { id },
      data: { isEmailVerified: true },
    });
  },

  async updatePassword(id: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  },

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  },

  async emailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    return !!user;
  },
};
