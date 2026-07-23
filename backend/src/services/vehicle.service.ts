import { VehicleRepository } from '../repositories/vehicle.repository';
import { UserRepository } from '../repositories/user.repository';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/upload.util';
import { CLOUDINARY_FOLDERS } from '../config/cloudinary.config';
import { sendVehicleStatusEmail } from '../utils/email.util';
import { Errors } from '../utils/appError.util';
import { parsePagination, buildPaginationMeta } from '../utils/response.util';
import { cache } from '../config/redis.config';
import type { CreateVehicleInput, UpdateVehicleInput } from '../validators/vehicle.validator';
import { VehicleType, FuelType, Transmission, VehicleStatus, UserRole } from '@prisma/client';

export const VehicleService = {
  // ── CRUD ─────────────────────────────────────

  async create(ownerId: string, input: CreateVehicleInput) {
    const owner = await UserRepository.findById(ownerId);
    if (!owner) throw Errors.notFound('User');

    const vehicle = await VehicleRepository.create({
      owner: { connect: { id: ownerId } },
      ...input,
      features: input.features ?? [],
    });

    await cache.invalidatePattern(`user:${ownerId}:vehicles`);
    return vehicle;
  },

  async getById(vehicleId: string, requesterId?: string, requesterRole?: string) {
    const cached = await cache.get<unknown>(cache.keys.vehicleDetail(vehicleId));
    let vehicle: any;

    if (cached) {
      vehicle = cached;
    } else {
      vehicle = await VehicleRepository.findById(vehicleId);
      if (!vehicle || vehicle.status === VehicleStatus.DELETED) throw Errors.notFound('Vehicle');
      await cache.set(cache.keys.vehicleDetail(vehicleId), vehicle, 120);
    }

    // Owner checks & KYC visibility
    const isOwner = requesterId && vehicle.ownerId === requesterId;
    const isAdmin = requesterRole && (requesterRole === UserRole.ADMIN || requesterRole === UserRole.SUPER_ADMIN);

    if (!vehicle.owner.isKycVerified && !isOwner && !isAdmin) {
      throw Errors.forbidden('This vehicle owner has not completed KYC verification yet.');
    }

    return vehicle;
  },

  async getMyVehicles(ownerId: string) {
    const cached = await cache.get<unknown>(cache.keys.userVehicles(ownerId));
    if (cached) return cached;

    const vehicles = await VehicleRepository.findByOwner(ownerId);
    await cache.set(cache.keys.userVehicles(ownerId), vehicles, 60);
    return vehicles;
  },

  async update(vehicleId: string, ownerId: string, input: UpdateVehicleInput) {
    const vehicle = await VehicleRepository.findByIdAndOwner(vehicleId, ownerId);
    if (!vehicle) throw Errors.notFound('Vehicle');
    if (vehicle.status === VehicleStatus.DELETED) throw Errors.notFound('Vehicle');

    const updated = await VehicleRepository.update(vehicleId, {
      ...input,
      // Reset to pending if key details changed
      status: VehicleStatus.PENDING_APPROVAL,
    });

    await cache.del(cache.keys.vehicleDetail(vehicleId));
    await cache.del(cache.keys.userVehicles(ownerId));
    return updated;
  },

  async delete(vehicleId: string, ownerId: string) {
    const vehicle = await VehicleRepository.findByIdAndOwner(vehicleId, ownerId);
    if (!vehicle) throw Errors.notFound('Vehicle');

    await VehicleRepository.softDelete(vehicleId);
    await cache.del(cache.keys.vehicleDetail(vehicleId));
    await cache.del(cache.keys.userVehicles(ownerId));
  },

  // ── Images ───────────────────────────────────

  async uploadImages(vehicleId: string, ownerId: string, buffers: Buffer[]) {
    const vehicle = await VehicleRepository.findByIdAndOwner(vehicleId, ownerId);
    if (!vehicle) throw Errors.notFound('Vehicle');

    const existingCount = await VehicleRepository.countImages(vehicleId);
    if (existingCount + buffers.length > 10) {
      throw Errors.badRequest('Maximum 10 images allowed per vehicle');
    }

    const uploads = await Promise.all(
      buffers.map((buf, i) =>
        uploadToCloudinary(buf, CLOUDINARY_FOLDERS.VEHICLES, {
          transformation: [{ width: 1200, height: 800, crop: 'fill' }],
        }).then((result) => ({
          ...result,
          isPrimary: existingCount === 0 && i === 0,
          order: existingCount + i,
        }))
      )
    );

    const images = await Promise.all(
      uploads.map((u) =>
        VehicleRepository.addImage(vehicleId, u.url, u.publicId, u.isPrimary, u.order)
      )
    );

    await cache.del(cache.keys.vehicleDetail(vehicleId));
    return images;
  },

  async deleteImage(vehicleId: string, imageId: string, ownerId: string) {
    const vehicle = await VehicleRepository.findByIdAndOwner(vehicleId, ownerId);
    if (!vehicle) throw Errors.notFound('Vehicle');

    const image = await VehicleRepository.findImageById(imageId);
    if (!image || image.vehicleId !== vehicleId) throw Errors.notFound('Image');

    await deleteFromCloudinary(image.publicId);
    await VehicleRepository.deleteImage(imageId);
    await cache.del(cache.keys.vehicleDetail(vehicleId));
  },

  async setPrimaryImage(vehicleId: string, imageId: string, ownerId: string) {
    const vehicle = await VehicleRepository.findByIdAndOwner(vehicleId, ownerId);
    if (!vehicle) throw Errors.notFound('Vehicle');

    await VehicleRepository.setPrimaryImage(vehicleId, imageId);
    await cache.del(cache.keys.vehicleDetail(vehicleId));
  },

  // ── Availability ──────────────────────────────

  async getAvailability(vehicleId: string) {
    return VehicleRepository.getAvailability(vehicleId);
  },

  async setAvailability(
    vehicleId: string,
    ownerId: string,
    data: { startDate: string; endDate: string; isBlocked: boolean; reason?: string }
  ) {
    const vehicle = await VehicleRepository.findByIdAndOwner(vehicleId, ownerId);
    if (!vehicle) throw Errors.notFound('Vehicle');

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) throw Errors.badRequest('End date must be after start date');

    return VehicleRepository.setAvailability(vehicleId, {
      startDate: start,
      endDate: end,
      isBlocked: data.isBlocked,
      reason: data.reason,
    });
  },

  // ── Search ────────────────────────────────────

  async search(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query);

    const cacheKey = cache.keys.vehicleList(JSON.stringify({ ...query, page, limit }));
    const cached = await cache.get<unknown>(cacheKey);
    if (cached) return cached;

    const { items, total } = await VehicleRepository.search({
      city: query.city as string,
      vehicleType: query.vehicleType as VehicleType,
      numberOfSeats: query.numberOfSeats as number,
      fuelType: query.fuelType as FuelType,
      transmission: query.transmission as Transmission,
      brand: query.brand as string,
      isAvailableForRent: query.availableForRent as boolean,
      isAvailableForSwap: query.availableForSwap as boolean,
      sortBy: query.sortBy as string,
      skip,
      take: limit,
    });

    const result = { items, meta: buildPaginationMeta(total, page, limit) };
    await cache.set(cacheKey, result, 300);
    return result;
  },

  // ── Admin ─────────────────────────────────────

  async adminList(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query);
    const status = query.status as VehicleStatus | undefined;
    const { items, total } = await VehicleRepository.adminList({ status, skip, take: limit });
    return { items, meta: buildPaginationMeta(total, page, limit) };
  },

  async adminApprove(vehicleId: string, adminId: string) {
    const vehicle = await VehicleRepository.findById(vehicleId);
    if (!vehicle) throw Errors.notFound('Vehicle');

    await VehicleRepository.adminApprove(vehicleId, adminId);

    const owner = await UserRepository.findById(vehicle.owner.id);
    if (owner) {
      await sendVehicleStatusEmail(
        owner.email,
        owner.name,
        `${vehicle.brand} ${vehicle.model}`,
        'ACTIVE'
      );
    }
    await cache.del(cache.keys.vehicleDetail(vehicleId));
  },

  async adminReject(vehicleId: string, adminId: string, reason: string) {
    const vehicle = await VehicleRepository.findById(vehicleId);
    if (!vehicle) throw Errors.notFound('Vehicle');

    await VehicleRepository.adminReject(vehicleId, adminId, reason);

    const owner = await UserRepository.findById(vehicle.owner.id);
    if (owner) {
      await sendVehicleStatusEmail(
        owner.email,
        owner.name,
        `${vehicle.brand} ${vehicle.model}`,
        'REJECTED',
        reason
      );
    }
    await cache.del(cache.keys.vehicleDetail(vehicleId));
  },
};
