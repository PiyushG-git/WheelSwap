import { Router } from 'express';
import { VehicleController } from '../../controllers/vehicle.controller';
import { authenticate, authorize, optionalAuthenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uploadVehicleImages } from '../../middlewares/upload.middleware';
import { uploadLimiter } from '../../middlewares/rateLimit.middleware';
import {
  CreateVehicleSchema,
  UpdateVehicleSchema,
  VehicleSearchSchema,
  SetAvailabilitySchema,
  AdminVehicleActionSchema,
} from '../../validators/vehicle.validator';
import { UserRole } from '@prisma/client';

const router = Router();

// ── Public search & details ────────────────────
router.get('/', validate(VehicleSearchSchema, 'query'), VehicleController.search);

// ── Protected user & admin static routes ───────
router.get('/my', authenticate, VehicleController.getMyVehicles);
router.get('/my/vehicles', authenticate, VehicleController.getMyVehicles);

router.get(
  '/admin/list',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  VehicleController.adminList
);

router.patch(
  '/admin/:id/approve',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  VehicleController.adminApprove
);

router.patch(
  '/admin/:id/reject',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(AdminVehicleActionSchema),
  VehicleController.adminReject
);

// ── Vehicle creation (Removed requireKyc) ──────
router.post(
  '/',
  authenticate,
  validate(CreateVehicleSchema),
  VehicleController.create
);

// ── Public parametric routes (Added optionalAuthenticate)
router.get('/:id', optionalAuthenticate, VehicleController.getById);
router.get('/:id/availability', optionalAuthenticate, VehicleController.getAvailability);

// ── Protected vehicle modification (Removed requireKyc)
router.patch(
  '/:id',
  authenticate,
  validate(UpdateVehicleSchema),
  VehicleController.update
);

router.delete('/:id', authenticate, VehicleController.delete);

// ── Images ────────────────────────────────────
router.post(
  '/:id/images',
  authenticate,
  uploadLimiter,
  uploadVehicleImages.array('images', 10),
  VehicleController.uploadImages
);

router.delete('/:id/images/:imageId', authenticate, VehicleController.deleteImage);
router.patch('/:id/images/:imageId/primary', authenticate, VehicleController.setPrimaryImage);

// ── Availability ──────────────────────────────
router.post(
  '/:id/availability',
  authenticate,
  validate(SetAvailabilitySchema),
  VehicleController.setAvailability
);

export default router;
