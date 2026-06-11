import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema, changePasswordSchema } from './auth.validation';

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────

/** POST /api/v1/auth/register */
router.post('/register', validate(registerSchema), authController.register);

/** POST /api/v1/auth/login */
router.post('/login', validate(loginSchema), authController.login);

/** POST /api/v1/auth/logout */
router.post('/logout', authController.logout);

// ─── Protected Routes ─────────────────────────────────────────────────────────

/** GET /api/v1/auth/me */
router.get('/me', authenticate, authController.getMe);

/** PATCH /api/v1/auth/change-password */
router.patch(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

export default router;
