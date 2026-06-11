import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';

const router = Router();

/**
 * Mount all API v1 feature routers here.
 * Each module owns its own sub-router and is registered under its prefix.
 */
router.use('/auth', authRoutes);

export default router;
