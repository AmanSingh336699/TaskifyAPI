import express from 'express';
import { healthCheckController } from '../controllers/health.controller.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin'))
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System health status
 */
router.get('/', healthCheckController);

export default router;