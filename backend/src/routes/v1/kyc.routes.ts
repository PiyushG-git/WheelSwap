import { Router } from 'express';
import { KycController } from '../../controllers/kyc.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uploadKycDocuments } from '../../middlewares/upload.middleware';
import { uploadLimiter } from '../../middlewares/rateLimit.middleware';
import {
  SubmitKycSchema,
  AdminKycActionSchema,
  KycListQuerySchema,
} from '../../validators/kyc.validator';
import { UserRole } from '@prisma/client';

const router = Router();

// All KYC routes require authentication
router.use(authenticate);

// User routes
router.post(
  '/submit',
  uploadLimiter,
  uploadKycDocuments.fields([
    { name: 'aadhaarFront', maxCount: 1 },
    { name: 'aadhaarBack', maxCount: 1 },
    { name: 'licenseFront', maxCount: 1 },
    { name: 'licenseBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]),
  validate(SubmitKycSchema),
  KycController.submit
);

router.get('/status', KycController.getStatus);

// Admin routes
router.get(
  '/admin/list',
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(KycListQuerySchema, 'query'),
  KycController.adminList
);

router.get(
  '/admin/:userId',
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  KycController.adminGetByUserId
);

router.patch(
  '/admin/:userId/approve',
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  KycController.adminApprove
);

router.patch(
  '/admin/:userId/reject',
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(AdminKycActionSchema),
  KycController.adminReject
);

export default router;
