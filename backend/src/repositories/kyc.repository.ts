import { prisma } from '../config/database.config';
import { KycStatus, Prisma } from '@prisma/client';

export const KycRepository = {
  async findByUserId(userId: string) {
    return prisma.kycDocument.findUnique({ where: { userId } });
  },

  async create(data: Prisma.KycDocumentCreateInput) {
    return prisma.kycDocument.create({ data });
  },

  async update(userId: string, data: Prisma.KycDocumentUpdateInput) {
    return prisma.kycDocument.update({ where: { userId }, data });
  },

  async findAll(filters: {
    status?: KycStatus;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.KycDocumentWhereInput = {};
    if (filters.status) where.status = filters.status;

    const [items, total] = await prisma.$transaction([
      prisma.kycDocument.findMany({
        where,
        skip: filters.skip ?? 0,
        take: filters.take ?? 20,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
          },
        },
      }),
      prisma.kycDocument.count({ where }),
    ]);

    return { items, total };
  },

  async approve(userId: string, adminId: string) {
    return prisma.$transaction([
      prisma.kycDocument.update({
        where: { userId },
        data: {
          status: KycStatus.APPROVED,
          verifiedAt: new Date(),
          verifiedById: adminId,
          rejectionReason: null,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { isKycVerified: true },
      }),
    ]);
  },

  async reject(userId: string, adminId: string, reason: string) {
    return prisma.$transaction([
      prisma.kycDocument.update({
        where: { userId },
        data: {
          status: KycStatus.REJECTED,
          verifiedById: adminId,
          rejectionReason: reason,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { isKycVerified: false },
      }),
    ]);
  },
};
