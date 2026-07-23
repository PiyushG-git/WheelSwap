import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import kycRoutes from './kyc.routes';
import vehicleRoutes from './vehicle.routes';

const router = Router();

// ── Health Check ──────────────────────────────

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'WheelSwap API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ── Feature Routes ────────────────────────────

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/kyc', kycRoutes);
router.use('/vehicles', vehicleRoutes);

export default router;
