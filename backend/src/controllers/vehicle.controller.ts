import { Request, Response } from 'express';
import { VehicleService } from '../services/vehicle.service';
import { ApiResponseBuilder } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { Errors } from '../utils/appError.util';

export const VehicleController = {
  // ── Public ───────────────────────────────────

  search: asyncHandler(async (req: Request, res: Response) => {
    const result = await VehicleService.search(req.query as Record<string, unknown>);
    ApiResponseBuilder.success(
      res,
      (result as { items: unknown[] }).items,
      'Vehicles fetched',
      200,
      (result as { meta: unknown }).meta as never
    );
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await VehicleService.getById(
      req.params.id,
      req.user?.id,
      req.user?.role
    );
    ApiResponseBuilder.success(res, vehicle);
  }),

  // ── Owner ────────────────────────────────────

  create: asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await VehicleService.create(req.user!.id, req.body);
    ApiResponseBuilder.created(
      res,
      vehicle,
      'Vehicle submitted for approval'
    );
  }),

  getMyVehicles: asyncHandler(async (req: Request, res: Response) => {
    const vehicles = await VehicleService.getMyVehicles(req.user!.id);
    ApiResponseBuilder.success(res, vehicles);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await VehicleService.update(req.params.id, req.user!.id, req.body);
    ApiResponseBuilder.success(res, vehicle, 'Vehicle updated');
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await VehicleService.delete(req.params.id, req.user!.id);
    ApiResponseBuilder.success(res, null, 'Vehicle deleted');
  }),

  // ── Images ───────────────────────────────────

  uploadImages: asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) throw Errors.badRequest('No images provided');

    const buffers = files.map((f) => f.buffer);
    const images = await VehicleService.uploadImages(req.params.id, req.user!.id, buffers);
    ApiResponseBuilder.created(res, images, 'Images uploaded successfully');
  }),

  deleteImage: asyncHandler(async (req: Request, res: Response) => {
    await VehicleService.deleteImage(req.params.id, req.params.imageId, req.user!.id);
    ApiResponseBuilder.success(res, null, 'Image deleted');
  }),

  setPrimaryImage: asyncHandler(async (req: Request, res: Response) => {
    await VehicleService.setPrimaryImage(req.params.id, req.params.imageId, req.user!.id);
    ApiResponseBuilder.success(res, null, 'Primary image updated');
  }),

  // ── Availability ──────────────────────────────

  getAvailability: asyncHandler(async (req: Request, res: Response) => {
    const slots = await VehicleService.getAvailability(req.params.id);
    ApiResponseBuilder.success(res, slots);
  }),

  setAvailability: asyncHandler(async (req: Request, res: Response) => {
    const slot = await VehicleService.setAvailability(
      req.params.id,
      req.user!.id,
      req.body
    );
    ApiResponseBuilder.created(res, slot, 'Availability updated');
  }),

  // ── Admin ─────────────────────────────────────

  adminList: asyncHandler(async (req: Request, res: Response) => {
    const result = await VehicleService.adminList(req.query as Record<string, unknown>);
    ApiResponseBuilder.success(
      res,
      (result as { items: unknown[] }).items,
      'Vehicles fetched',
      200,
      (result as { meta: unknown }).meta as never
    );
  }),

  adminApprove: asyncHandler(async (req: Request, res: Response) => {
    await VehicleService.adminApprove(req.params.id, req.user!.id);
    ApiResponseBuilder.success(res, null, 'Vehicle approved');
  }),

  adminReject: asyncHandler(async (req: Request, res: Response) => {
    const { rejectionReason } = req.body;
    if (!rejectionReason) throw Errors.badRequest('Rejection reason is required');
    await VehicleService.adminReject(req.params.id, req.user!.id, rejectionReason);
    ApiResponseBuilder.success(res, null, 'Vehicle rejected');
  }),
};
