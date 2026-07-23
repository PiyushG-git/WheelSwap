import { Router } from 'express';
import { UserController } from '../../controllers/user.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uploadSingleImage } from '../../middlewares/upload.middleware';
import { uploadLimiter } from '../../middlewares/rateLimit.middleware';
import { UpdateProfileSchema } from '../../validators/user.validator';

const router = Router();

// All user routes are protected
router.use(authenticate);

router.get('/me', UserController.getMe);
router.patch('/me', validate(UpdateProfileSchema), UserController.updateMe);
router.post('/me/avatar', uploadLimiter, uploadSingleImage.single('avatar'), UserController.uploadAvatar);
router.get('/:id', UserController.getPublicProfile);

export default router;
