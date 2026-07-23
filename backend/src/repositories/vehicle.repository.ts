import { prisma } from '../config/database.config';
import { Prisma, VehicleStatus, VehicleType, FuelType, Transmission } from '@prisma/client';

// ─────────────────────────────────────────────
// Common include for vehicle responses
// ─────────────────────────────────────────────

export const vehicleWithDetails = {
  images: { orderBy: { order: 'asc' as const } },
  owner: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      city: true,
      isKycVerified: true,
      createdAt: true,
    },
  },
};

export const vehicleListSelect = {
  id: true,
  brand: true,
  model: true,
  year: true,
  vehicleType: true,
  fuelType: true,
  transmission: true,
  numberOfSeats: true,
  color: true,
  city: true,
  state: true,
  dailyRentalRate: true,
  securityDeposit: true,
  isAvailableForRent: true,
  isAvailableForSwap: true,
  status: true,
  images: { where: { isPrimary: true }, take: 1 },
  owner: {
    select: { id: true, name: true, avatarUrl: true, isKycVerified: true },
  },
};

// ─────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────

export const VehicleRepository = {
  async create(data: Prisma.VehicleCreateInput) {
    return prisma.vehicle.create({
      data,
      include: vehicleWithDetails,
    });
  },

  async findById(id: string) {
    return prisma.vehicle.findUnique({
      where: { id, deletedAt: null },
      include: vehicleWithDetails,
    });
  },

  async findByIdAndOwner(id: string, ownerId: string) {
    return prisma.vehicle.findFirst({
      where: { id, ownerId, deletedAt: null },
      include: vehicleWithDetails,
    });
  },

  async findByOwner(ownerId: string) {
    return prisma.vehicle.findMany({
      where: { ownerId, deletedAt: null },
      include: vehicleWithDetails,
      orderBy: { createdAt: 'desc' },
    });
  },

  async update(id: string, data: Prisma.VehicleUpdateInput) {
    return prisma.vehicle.update({
      where: { id },
      data,
      include: vehicleWithDetails,
    });
  },

  async softDelete(id: string) {
    return prisma.vehicle.update({
      where: { id },
      data: { deletedAt: new Date(), status: VehicleStatus.DELETED },
    });
  },

  // ── Images ───────────────────────────────────

  async addImage(vehicleId: string, url: string, publicId: string, isPrimary: boolean, order: number) {
    return prisma.vehicleImage.create({
      data: { vehicleId, url, publicId, isPrimary, order },
    });
  },

  async deleteImage(imageId: string) {
    return prisma.vehicleImage.delete({ where: { id: imageId } });
  },

  async findImageById(id: string) {
    return prisma.vehicleImage.findUnique({ where: { id } });
  },

  async setPrimaryImage(vehicleId: string, imageId: string) {
    return prisma.$transaction([
      prisma.vehicleImage.updateMany({
        where: { vehicleId },
        data: { isPrimary: false },
      }),
      prisma.vehicleImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);
  },

  async countImages(vehicleId: string): Promise<number> {
    return prisma.vehicleImage.count({ where: { vehicleId } });
  },

  // ── Availability ──────────────────────────────

  async getAvailability(vehicleId: string) {
    return prisma.vehicleAvailability.findMany({
      where: { vehicleId },
      orderBy: { startDate: 'asc' },
    });
  },

  async setAvailability(vehicleId: string, data: {
    startDate: Date;
    endDate: Date;
    isBlocked: boolean;
    reason?: string;
  }) {
    return prisma.vehicleAvailability.create({ data: { vehicleId, ...data } });
  },

  async deleteAvailability(id: string) {
    return prisma.vehicleAvailability.delete({ where: { id } });
  },

  // ── Search ────────────────────────────────────

  async search(filters: {
    city?: string;
    vehicleType?: VehicleType;
    numberOfSeats?: number;
    fuelType?: FuelType;
    transmission?: Transmission;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    isAvailableForRent?: boolean;
    isAvailableForSwap?: boolean;
    skip?: number;
    take?: number;
    sortBy?: string;
  }) {
    const where: Prisma.VehicleWhereInput = {
      status: VehicleStatus.ACTIVE,
      deletedAt: null,
    };

    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.vehicleType) where.vehicleType = filters.vehicleType;
    if (filters.numberOfSeats) where.numberOfSeats = { gte: filters.numberOfSeats };
    if (filters.fuelType) where.fuelType = filters.fuelType;
    if (filters.transmission) where.transmission = filters.transmission;
    if (filters.brand) where.brand = { contains: filters.brand, mode: 'insensitive' };
    if (filters.minPrice || filters.maxPrice) {
      where.dailyRentalRate = {
        ...(filters.minPrice && { gte: filters.minPrice }),
        ...(filters.maxPrice && { lte: filters.maxPrice }),
      };
    }
    if (filters.isAvailableForRent !== undefined)
      where.isAvailableForRent = filters.isAvailableForRent;
    if (filters.isAvailableForSwap !== undefined)
      where.isAvailableForSwap = filters.isAvailableForSwap;

    const orderBy: Prisma.VehicleOrderByWithRelationInput =
      filters.sortBy === 'price_asc'
        ? { dailyRentalRate: 'asc' }
        : filters.sortBy === 'price_desc'
        ? { dailyRentalRate: 'desc' }
        : { createdAt: 'desc' };

    const [items, total] = await prisma.$transaction([
      prisma.vehicle.findMany({
        where,
        select: vehicleListSelect,
        skip: filters.skip ?? 0,
        take: filters.take ?? 12,
        orderBy,
      }),
      prisma.vehicle.count({ where }),
    ]);

    return { items, total };
  },

  // ── Admin ─────────────────────────────────────

  async adminList(filters: { status?: VehicleStatus; skip?: number; take?: number }) {
    const where: Prisma.VehicleWhereInput = { deletedAt: null };
    if (filters.status) where.status = filters.status;

    const [items, total] = await prisma.$transaction([
      prisma.vehicle.findMany({
        where,
        include: vehicleWithDetails,
        skip: filters.skip ?? 0,
        take: filters.take ?? 20,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return { items, total };
  },

  async adminApprove(id: string, adminId: string) {
    return prisma.vehicle.update({
      where: { id },
      data: {
        status: VehicleStatus.ACTIVE,
        approvedAt: new Date(),
        approvedById: adminId,
        rejectionReason: null,
      },
    });
  },

  async adminReject(id: string, adminId: string, reason: string) {
    return prisma.vehicle.update({
      where: { id },
      data: {
        status: VehicleStatus.SUSPENDED,
        approvedById: adminId,
        rejectionReason: reason,
      },
    });
  },
};
